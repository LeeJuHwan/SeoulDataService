from transformers import AutoTokenizer, AutoModel
import faiss
import numpy as np

class PseudoTextSearchSystem:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("kykim/bert-kor-base")
        self.model = AutoModel.from_pretrained("kykim/bert-kor-base")
        self.index = None
        self.text_db = []
        
    def add_text_to_db(self, text):
        self.text_db.append(text)
        
    def build_index(self):
        embeddings = self._get_embeddings(self.text_db)
        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index.add(embeddings)
        
    def search_text(self, query, k=5):
        if self.index is None:
            raise ValueError("Index is not built yet. Call build_index() first.")
        
        query_embedding = self._get_embeddings([query])[0]
        distances, indices = self.index.search(np.array([query_embedding]), k)
        results = [(self.text_db[idx], score) for idx, score in zip(indices[0], distances[0])]
        return results
        
    def _get_embeddings(self, texts):
        encoded_input = self.tokenizer(texts, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            model_output = self.model(**encoded_input)
            embeddings = model_output.last_hidden_state[:, 0, :].numpy()
        return embeddings