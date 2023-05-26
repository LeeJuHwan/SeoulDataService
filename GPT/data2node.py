import pickle
import json
import pandas as pd
import numpy as np
from tqdm import tqdm

from collections import Counter

from sklearn.preprocessing import MinMaxScaler

from faiss_index import FaissIndex


class NumpyEncoder(json.JSONEncoder):
    """ Custom encoder for numpy data types """

    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):
            return int(obj)

        elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
            return float(obj)

        elif isinstance(obj, (np.complex_, np.complex64, np.complex128)):
            return {'real': obj.real, 'imag': obj.imag}

        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()

        elif isinstance(obj, (np.bool_)):
            return bool(obj)

        elif isinstance(obj, (np.void)):
            return None

        return json.JSONEncoder.default(self, obj)


class Data2Node:
    def __init__(self, index_file_path, data_file_path, node_json_path, embeddings_path) -> None:
        self.nodes = None
        self.label = None
        self.index_file_path = index_file_path
        self.data_file_path = data_file_path
        self.node_json_path = node_json_path
        self.embeddings_path = embeddings_path
        self._load_index()

    def _load_index(self):
        self.index = FaissIndex(index_file_path=index_file_path,
                                data_file_path=data_file_path,
                                embeddings_path=embeddings_path)
        self.index.load_index()

    def _set_nodes(self, id_Col: str, data_Col: str, group_name: str):
        df = pd.read_csv(self.data_file_path)

        df[id_Col] = df[id_Col].apply(lambda x: int(x.split('-')[1]))
        df = df[df['소분류'] == group_name]
        df['collapsed'] = True
        nodes = df[[id_Col, data_Col, 'collapsed']].T
        nodes.index = ['id', 'name', 'collapsed']
        nodes = nodes.astype('str')
        self.nodes = list(nodes.to_dict().values())
        # print(self.nodes)

    def _set_links(self):
        embeddings = self._load_embeddings()
        distances, idxs = self.index.index.search(embeddings, len(embeddings))
        self.links = []
        for i, row in tqdm(enumerate(idxs)):
            source = row[0]
            # print(row[i:])
            for c, target in enumerate(row[1:], start=1):
                # print(source, target, distances_int[i][c])
                if c == 1:  # 노드당 1개 이상 링크 가질 수 있도록
                    link = {"source": str(source),
                            "target": str(target),
                            "distances": 0}
                else:
                    link = {"source": str(source),
                            "target": str(target),
                            "distances": int(distances[i][c])}
                self.links.append(link)

    def _set_info(self):
        # 'distances' 값을 기준으로 오름차순 정렬
        sorted_list = sorted(self.links, key=lambda x: x['distances'])

        # 전체 노드 개수의 10%에 해당하는 인덱스를 계산
        num_items = len(self.nodes)
        num_selected = int(num_items * 10)

        # 하위 10%에 해당하는 'distances' 값을 가진 딕셔너리 추출
        selected_list = sorted_list[:num_selected]

        # 'distances' 값들을 추출하여 MinMaxScaler로 변환
        distances = [item['distances'] for item in selected_list]
        scaler = MinMaxScaler(feature_range=(1, 10))
        scaled_distances = scaler.fit_transform([[d] for d in distances])
        # print(min(scaled_distances), max(scaled_distances))
        # 변환된 값을 기존 딕셔너리에 반영
        for i, item in enumerate(selected_list):
            item['distances'] = int(scaled_distances[i][0])

        # 결과 출력
        self.links = selected_list

    def _add_node_size(self):
        # 'source'와 'target' 값들의 등장 횟수 계산
        values = [item['source'] for item in self.links] + \
            [item['target'] for item in self.links]
        value_counts = Counter(values)

        # 등장 횟수를 MinMaxScaler로 변환
        counts = list(value_counts.values())
        scaler = MinMaxScaler(feature_range=(2, 10))
        scaled_counts = scaler.fit_transform([[count] for count in counts])

        for key, dist in zip(list(value_counts.keys()), scaled_counts):
            value_counts[key] = int(dist[0])

        for node in self.nodes:
            try:
                node['size'] = value_counts[node['id']]
            except:
                node['size'] = 1

        value_counts

    def _set_total(self):
        self.total = {"nodes": self.nodes, "links": self.links}

    def _load_embeddings(self):
        with open(self.embeddings_path, 'rb') as f:
            embeddings = pickle.load(f)
        return embeddings

    def _save_total(self, group_key: int):
        with open(f'{self.node_json_path}total_{str(group_key)}.json', 'w', encoding='utf-8') as f:
            json.dump(self.total, f, cls=NumpyEncoder,
                      indent=2, ensure_ascii=False)


if __name__ == '__main__':
    label_path = 'Opendata/csv_file/label_dict.pkl'

    with open(label_path, 'rb') as f:
        label = pickle.load(f)

    data_file_path = 'Opendata/csv_file/서울시 공공데이터 최종.csv'
    node_json_path = 'Opendata/csv_file/json/'

    for key, name in label.items():
        print(key, name)
        index_file_path = f'Opendata/web/index_{key}.faiss'
        embeddings_path = f'Opendata/csv_file/embeddings_{key}.pkl'

        data2node = Data2Node(index_file_path, data_file_path,
                              node_json_path, embeddings_path)
        data2node._set_nodes(id_Col='서비스ID', data_Col='서비스명', group_name=name)
        data2node._set_links()
        data2node._set_info()
        data2node._add_node_size()
        data2node._set_total()
        data2node._save_total(group_key=key)
