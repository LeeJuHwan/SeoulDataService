from django.shortcuts import render
from django.views.generic import TemplateView
from django.views import View
from .models import SeoulData
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

from web.tasks import add


class Test(views.APIView):
    def get(self, request: HttpRequest):
        result = add.delay(2, 5)
        while not result.ready():
            time.sleep(1)
        task_result = AsyncResult(result.task_id)

        result_dict = {
            "task_id": result.task_id,
            "task_status": task_result.status,
            "task_result": task_result.result,
        }
        print("RESULT:, ", result_dict)
        return Response(result.task_id, status=202)


class MainView(TemplateView):
    template_name = "web/index.html"

    query = "지하철"  # input
    # result = LoadConfig.index.search_query(query=query, k=6)["data"]
    result = LoadConfig.index.search_idx(12035, k=6)["data"][1:]
    print(result)
    # for num, i in enumerate(result):
    #     # filtering = f"OA-{result[0]}"
    #     filtering = f"OA-{i[0]}"
    #     queryset = SeoulData.objects.filter(서비스ID=filtering)
    #     print(f"{num} >> {queryset.values_list()}")
    # queryset = SeoulData.objects.filter(서비스ID=filtering)
    # print(queryset.values_list())


class ChangeListView(TemplateView):
    template_name = "web/list_view.html"


class OpenDataView(View):
    """Project data list and cart product."""

    template_name = "web/seouldata_list.html"

    def get(self, request):
        """Connect urls."""

        start_time = time.time()
        get_redis = cache.get("seouldata")
        print("get_reids", get_redis)
        if not get_redis:
            seouldata_queryset = SeoulData.objects.all()
            cart_items = self.request.session.get("cart_items", {})
            datacart_items = get_session(cart_items, SeoulData)
            context = {
                "seouldata_list": seouldata_queryset,
                "datacart_list": datacart_items,
            }
            get_redis = cache.set("seouldata", context)
        end_time = time.time()
        get_redis = cache.get("seouldata")
        print(f"get : {end_time - start_time}")
        return render(request, self.template_name, get_redis)

    def post(self, request):
        """Submit or remove data."""
        cart_items = self.request.session.get("cart_items", {})
        queryset = SeoulData.objects.all()
        context = {
            "seouldata_list": queryset,
            "datacart_list": get_session(cart_items, SeoulData),
        }

        if "selected_items" in request.POST:  # add data
            id_list = self.request.POST.getlist("selected_items")
            for product_id in id_list:
                cart_items[product_id] = cart_items.get(product_id, 1)
            self.request.session["cart_items"] = cart_items
            return render(request, self.template_name, context)

        elif "item_id" in request.POST:  # remove data
            product_id = self.request.POST.get("item_id")
            if product_id in cart_items:
                cart_items[product_id] -= 1
                if cart_items[product_id] == 0:
                    del cart_items[product_id]
            self.request.session["cart_items"] = cart_items

            queryset = SeoulData.objects.all()
            context = {
                "seouldata_list": queryset,
                "datacart_list": get_session(cart_items, SeoulData),
            }
            return render(request, self.template_name, context)

        else:  # 데이터를 선택하는 경우
            responseData = json.loads(request.body)
            id = responseData["data"]
            detail = SeoulData.objects.filter(서비스ID=id)
            serialized_data = [item.to_dict() for item in detail]
            response_data = {
                "data": serialized_data,
                "message": "success",
            }
            return JsonResponse(response_data)
