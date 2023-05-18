from faiss_index import FaissIndex

if __name__ == '__main__':
    index_file_path = 'Opendata/web/index.faiss'
    data_file_path = 'Opendata/csv_file/서울시 공공데이터 최종_reg1.csv'
    embeddings_path = 'Opendata/csv_file/embeddings.pkl'

    index = FaissIndex(index_file_path=index_file_path,
                       data_file_path=data_file_path,
                       embeddings_path=embeddings_path)

    index.build_index(id_Col='서비스ID', data_Col='서비스명')
