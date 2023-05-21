from django.conf import settings
from celery import Celery
from celery import shared_task
from web.gpt import Brainstoming
import json


@shared_task
def gpt_recommandation(data_info, _field, _purpose, topics=5):
    """GPT 입력 데이터 추출 및 프롬프트 실행 후 반환"""
    bs = Brainstoming()

    result_data = bs.process_run(data_info, _field, _purpose, topics)
    return [json.dumps(i) for i in result_data["data"].replace("\\", "")]
