from django.shortcuts import render
from django.views.generic import TemplateView
from django.views import View
from .models import SeoulData, DataColumn
from .get_session import get_session
from django.core.cache import cache
from django.http import JsonResponse
from Opendata.load import LoadConfig

import json
import time


from django.http import HttpRequest
from rest_framework import views
from rest_framework.response import Response
from celery.result import AsyncResult

from web.tasks import gpt_recommandation
from web.papago_translater import trans


############### JSON DATA ###############
def node_coordinate(request):
    with open("/Opendata/csv_file/json/total_11.json", "r") as f:
        data = json.load(f)
    return JsonResponse(data)


############### Graph View ###############
class MainView(View):
    # template_name = "web/index2.html"
    template_name = "web/index.html"

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        responseData = json.loads(request.body)
        print("responseData:", responseData)
        responseDicKey = list(responseData.keys())[0]
        print("responseDicKey", responseDicKey)

        # 노드를 클릭했을 때
        if responseDicKey == "data":
            print("responseList: ", responseDicKey)

            id = responseData["data"]
            filtering = f"OA-{id}"
            detail = SeoulData.objects.filter(서비스ID=filtering)
            detail_data = [item.to_dict() for item in detail]
            # print("serialized_data", serialized_data)

            similar_data = []
            result = LoadConfig.index.search_idx(int(id), k=6)["data"][1:]
            # print("RESULT: ", result)

            for num, i in enumerate(result):
                filtering = f"OA-{i[0]}"
                queryset = SeoulData.objects.filter(서비스ID=filtering)
                temp = [item.to_dict() for item in queryset]
                similar_data.append(temp)
            # print("similar_data", similar_data)

            response_data = {
                "detail_data": detail_data,
                "similar_data": similar_data,
                "message": "success",
            }
            return JsonResponse(response_data)

        # 주제 생성 버튼을 클릭했을 때
        elif responseDicKey == "cartData":
            print("cartData", responseData["cartData"])
            source_id = [i.replace(" ", "") for i in responseData["cartData"]]

            ################ GPT ###############
            data_info = {}
            for node_id in source_id:
                queryset = DataColumn.objects.filter(INF_ID=node_id)
                if queryset.values_list():
                    gpt_input_columns = []

                    for i in queryset.values_list():
                        temp = {}
                        temp["column_name"] = i[2]
                        temp["column_description"] = i[3]
                        gpt_input_columns.append(temp)

                else:
                    gpt_input_columns = [
                        {"column_name": "내용 없음", "column_description": "내용 없음"}
                    ]

                queryset = SeoulData.objects.filter(서비스ID=node_id).values()[0]
                data_info[queryset["서비스ID"]] = {
                    "data_name": queryset["서비스명"],
                    "data_description": queryset["서비스설명"],
                    "columns": gpt_input_columns,
                }
            
            field = responseData["addition"][0]
            purpose = responseData["addition"][1]
            num_topics = 5
            
            print("########### 프롬프트 아웃풋 #########")

            # async tasks
            result = gpt_recommandation.delay(data_info, field, purpose, num_topics)
            task_result = result.get()
            print(task_result)
            subjectResult = task_result

            # papago translater api -> 1회 요청 리소스 1717/10000
            # print("Korean ver.", trans(task_result))
            # subjectResult = [trans(task_result)]

            # 임시 필요 없는 코드
            response_data = {"subjectResult": subjectResult}

            return JsonResponse(response_data)

        # create graph
        elif responseDicKey == "category":
            json_key = responseData.get("category", 0)
            # print("JSON :", json_key)
            with open(f"/Opendata/csv_file/json/total_{json_key}.json", "r") as f:
                data = json.load(f)
            return JsonResponse(data)
