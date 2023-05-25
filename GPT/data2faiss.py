from faiss_index import FaissIndex
import pickle

if __name__ == '__main__':
    label_path = 'Opendata/csv_file/label_dict.pkl'
    with open(label_path, 'rb') as f:
        label = pickle.load(f)

    data_file_path = 'Opendata/csv_file/서울시 공공데이터 최종.csv'

    for key, name in label.items():
        index_file_path = f'Opendata/web/index_{key}.faiss'
        embeddings_path = f'Opendata/csv_file/embeddings_{key}.pkl'
        index = FaissIndex(index_file_path=index_file_path,
                           data_file_path=data_file_path,
                           embeddings_path=embeddings_path
                           )
        index.build_index(id_Col='서비스ID', data_Col='서비스명', group_name=name)
        index.save_index()
