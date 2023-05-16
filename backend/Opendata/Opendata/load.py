from django.apps import AppConfig
from web.faiss_index import FaissIndex


class LoadConfig(AppConfig):
    index = FaissIndex(index_file_path="web/index.faiss")
    index.load_index()

    def ready(self):
        pass
