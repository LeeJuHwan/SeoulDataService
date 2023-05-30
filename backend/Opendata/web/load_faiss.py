from web.faiss_index import FaissIndex


def category_by_faiss_load(num=0):
    index = FaissIndex(index_file_path=f"web/index.faiss")
    index.load_index()
    return index