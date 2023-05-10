from django.conf import settings
from celery import Celery
from celery import shared_task


@shared_task
def add(x, y):
    print("test Celery task : ", x + y)
    return x + y
