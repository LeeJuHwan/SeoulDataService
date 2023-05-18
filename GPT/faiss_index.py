from transformers import AutoTokenizer, AutoModel
import faiss
import numpy as np
import torch
import pandas as pd
import pickle


class FaissIndex:
    """
    Faiss index for semantic search using BERT embeddings.
    """

    def __init__(self, index_file_path: str, data_file_path: str, embeddings_path: str):
        """
        Initialize Faiss index with a specified file path.

        Args:
            index_file_path: Path to Faiss index file.
        """
        self.tokenizer = AutoTokenizer.from_pretrained("kykim/bert-kor-base")
        self.model = AutoModel.from_pretrained("kykim/bert-kor-base")
        self.index_file_path = index_file_path
        self.data_file_path = data_file_path
        self.embeddings_path = embeddings_path

        self.index = None
        if not self.load_index():
            print('index_file_path is not exist ')

    def _get_embeddings(self, texts: list) -> list:
        """
        Get BERT embeddings for input texts.

        Args:
            texts: List of strings to embed.

        Returns:
            List of BERT embeddings as numpy arrays.
        """
        encoded_input = self.tokenizer(
            texts, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            model_output = self.model(**encoded_input)
            embeddings = model_output.last_hidden_state[:, 0, :].numpy()
        return embeddings

    def build_index(self, id_Col: str, data_Col: str):
        """
        Build Faiss index using data from a CSV file.

        Args:
            data_file_path: Path to CSV file containing data to index.
        """
        df = pd.read_csv(self.data_file_path)

        titles = df[data_Col].to_list()
        idxs = df[id_Col].to_list()
        idxs = np.array([int(idx.split('-')[1])
                         for idx in idxs]).astype('int64')

        embeddings = self._get_embeddings(titles)

        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index = faiss.IndexIDMap2(self.index)
        self.index.add_with_ids(embeddings, idxs)

        ############# -----------------#############
        with open(self.embeddings_path, 'wb') as f:
            pickle.dump(embeddings, f)

    def save_index(self):
        """
        Save Faiss index to disk.
        """
        if self.index:
            faiss.write_index(self.index, self.index_file_path)

    def load_index(self) -> bool:
        """
        Load Faiss index from disk.

        Returns:
            True if index was loaded successfully, False otherwise.
        """
        try:
            self.index = faiss.read_index(self.index_file_path)
            return True
        except:
            return False

    def search_query(self, query: str, k: int = 5) -> dict:
        """
        Perform a semantic search for a given query string.

        Args:
            query: String to search for.
            k: Number of results to return.

        Returns:
            A dictionary with keys 'status', 'msg', and 'data'. The 'status'
            key is True if the search was successful, False otherwise. The
            'msg' key contains a message describing the search results. The
            'data' key contains a list of (id, score) tuples representing
            the search results.
        """
        if not query:
            return {'status': False,
                    'msg': 'Empty query string.',
                    'data': []}

        if self.index is None:
            if not self.load_index():
                return {'status': False,
                        'msg': 'Failed to load index file.',
                        'data': []}

        if query:
            search_embedding = self._get_embeddings([query])[0]
            distances, idxs = self.index.search(
                np.array([search_embedding]), k)
            data = [(int(idx), float(score))
                    for idx, score in zip(idxs[0], distances[0])]
            return {'status': True,
                    'msg': f'"{query}" search results',
                    'data': data}
        else:
            return {'status': False,
                    'msg': 'Query is not exist',
                    'data': []}

    def search_idx(self, idx: int, k: int = 5) -> dict:
        """
        Perform a id search for a given id int.

        Args:
            idx: Int to search for.
            k: Number of results to return.

        Returns:
            A dictionary with keys 'status', 'msg', and 'data'. The 'status'
            key is True if the search was successful, False otherwise. The
            'msg' key contains a message describing the search results. The
            'data' key contains a list of (id, score) tuples representing
            the search results.
        """

        if not idx:
            return {'status': False,
                    'msg': 'Empty idx int.',
                    'data': []}

        if self.index is None:
            if not self.load_index():
                return {'status': False,
                        'msg': 'Failed to load index file.',
                        'data': []}

        try:
            search_embedding = self.index.reconstruct(idx)
            try:
                distances, idxs = self.index.search(
                    np.array([search_embedding]), k)
                data = [(int(idx), float(score))
                        for idx, score in zip(idxs[0], distances[0])]
                return {'status': True,
                        'msg': f'"idx={idx}" search results',
                        'data': data}
            except:
                return {'status': False,
                        'msg': 'search_idx function error',
                        'data': []}
        except:
            return {'status': False,
                    'msg': 'Failed to found idx in faiss',
                    'data': []}


if __name__ == '__main__':
    # pip install transformers faiss-cpu numpy torch pandas
    # from faiss_index import FaissIndex

    # Faiss 구축(처음에만)
    # FaissIndex 객체를 생성합니다.
    # index = FaissIndex(index_file_path='index.faiss')

    # 데이터 파일로부터 인덱스를 구축합니다.
    # index.build_index(data_file_path='Crawling/서울시 공공데이터 최종.csv',
    #                   id_Col='서비스ID', data_Col='서비스명')

    # 인덱스를 저장합니다.
    # index.save_index()

    # --------------------------------------------
    # Faiss 로드
    # FaissIndex 객체를 생성합니다.
    index_file_path = 'Opendata/web/index.faiss'
    data_file_path = 'Opendata/csv_file/서울시 공공데이터 최종_reg1.csv'
    embeddings_path = 'Opendata/web/embeddings.pkl'

    index = FaissIndex(index_file_path=index_file_path,
                       data_file_path=data_file_path,
                       embeddings_path=embeddings_path)

    # index.build_index(data_file_path='Crawling/서울시 공공데이터 최종.csv',
    #                   id_Col='서비스ID', data_Col='서비스명')

    # 인덱스를 로드
    index.load_index()

    # 검색 예시
    query = '지하철'
    result = index.search_query(query=query, k=5)
    print(result)
