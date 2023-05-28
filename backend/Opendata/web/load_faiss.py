def category_by_faiss_load(cls, num=None):
    index = cls(index_file_path="web/index.faiss" or f"web/index_{num}.faiss")
    return index