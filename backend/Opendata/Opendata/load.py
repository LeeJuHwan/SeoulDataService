from django.apps import AppConfig
from web.faiss_index import FaissIndex


class LoadConfig(AppConfig):
    # def __init__(self, index_num_of_category):
    index = FaissIndex(index_file_path=f"web/index.faiss")
    # index = FaissIndex(index_file_path=f"web/index_{index_num_of_category}.faiss")
    index.load_index()

    def ready(self):
        pass
