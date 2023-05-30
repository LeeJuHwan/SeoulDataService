from django.apps import AppConfig
from web.faiss_index import FaissIndex


class LoadConfig(AppConfig):
    
        # index = FaissIndex(index_file_path=f"web/index.faiss")
    index = FaissIndex()

    def ready(self):
        pass
