import pickle
import json
import pandas as pd
import numpy as np

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA


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
        self.total = None
        self.index_file_path = index_file_path
        self.data_file_path = data_file_path
        self.node_json_path = node_json_path
        self.embeddings_path = embeddings_path

    def _set_nodes(self, id_Col: str, data_Col: str, group_Col: str):
        df = pd.read_csv(self.data_file_path)

        df[id_Col] = df[id_Col].apply(lambda x: int(x.split('-')[1]))

        label_encoder = LabelEncoder()
        cols = df[group_Col].unique()
        label_encoder.fit(cols)
        labels = label_encoder.transform(cols)

        df[group_Col] = label_encoder.transform(df[group_Col])

        nodes = df[[id_Col, data_Col, group_Col]].T
        nodes.index = ['id', 'name', 'group']
        nodes = nodes.astype('str')
        self.nodes = list(nodes.to_dict().values())
        self.label = {key: value for key, value in zip(
            labels, label_encoder.classes_)}

    def _set_xyz(self):
        pca = PCA(n_components=3)
        embeddings_3 = pca.fit_transform(self._load_embeddings())
        scaler = MinMaxScaler((-500, 500))
        embeddings_3_int = scaler.fit_transform(embeddings_3).astype(int)

        for node, xyz in zip(self.nodes, embeddings_3_int):
            node['fx'] = xyz[0]
            node['fy'] = xyz[1]
            node['fz'] = xyz[2]

    def _load_embeddings(self):
        with open(self.embeddings_path, 'rb') as f:
            embeddings = pickle.load(f)
        return embeddings

    def _set_total(self):
        self.total = {"nodes": self.nodes, "links": []}

    def _group_init(self):
        df_nodes = pd.DataFrame(self.total['nodes'])
        df_nodes['collapsed'] = True

        for key in self.label.keys():
            nodes = list(df_nodes[df_nodes['group'] == str(key)].drop(
                'group', axis=1).T.to_dict().values())
            res = {'nodes': nodes, 'links': []}
            with open(f'{self.node_json_path}total_{str(key)}.json', 'w', encoding='utf-8') as f:
                json.dump(res, f, cls=NumpyEncoder,
                          indent=2, ensure_ascii=False)


if __name__ == '__main__':
    index_file_path = 'Opendata/web/index.faiss'
    data_file_path = 'Opendata/csv_file/서울시 공공데이터 최종_reg1.csv'
    embeddings_path = 'Opendata/csv_file/embeddings.pkl'

    node_json_path = 'Opendata/csv_file/json/'

    data2node = Data2Node(index_file_path, data_file_path,
                          node_json_path, embeddings_path)
    data2node._set_nodes(id_Col='서비스ID', data_Col='서비스명', group_Col='소분류')
    data2node._set_xyz()
    data2node._set_total()
    data2node._group_init()
