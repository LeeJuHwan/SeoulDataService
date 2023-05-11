import os
from .celery import app as celery_app

__all__ = ["celery_app"]

if os.environ.get("RUN_MAIN", None) != "true":
    default_app_config = "load.LoadConfig"
