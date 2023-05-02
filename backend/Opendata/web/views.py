from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, RedirectView
from django.views import View
from .models import SeoulData
from .get_session import get_session
import time
from django.core.cache import cache
from django.middleware import csrf
from django.http import HttpResponse, JsonResponse
import json


class MainView(TemplateView):
    template_name = "web/main.html"
    
    def get_context_data(self, **kwargs: str) -> dict[str, str]:
        context =  super().get_context_data(**kwargs)
        context["name"] = "My project"
        return context

class OpenDataView(View):
    """Project data list and cart product."""
    template_name = "web/seouldata_list.html"
    
    def get(self, request):
        # del request.session['cart_items']
        
        """Connect urls."""
        start_time = time.time()
        get_redis = cache.get('seouldata')
        print("get_reids", get_redis)
        if not get_redis:
            seouldata_queryset = SeoulData.objects.all()
            cart_items = self.request.session.get('cart_items', {})
            datacart_items = get_session(cart_items, SeoulData)
            context = {"seouldata_list" : seouldata_queryset,
                        "datacart_list" : datacart_items}
            get_redis = cache.set('seouldata', context)
        end_time = time.time()
        get_redis = cache.get('seouldata')
        print(f"get : {end_time - start_time}")
        return render(request, self.template_name, get_redis)

    def post(self, request):
        """Submit or remove data."""
        start_time = time.time()
        cart_items = self.request.session.get('cart_items', {})
        print("REQUEST : ", request.POST)
        queryset = SeoulData.objects.all()
        context = {"seouldata_list" : queryset, "datacart_list" : get_session(cart_items, SeoulData)}

        if 'selected_items' in request.POST:  # 데이터를 추가하는 경우
            id_list = self.request.POST.getlist("selected_items")
            print("#####", id_list)
            for product_id in id_list:
                cart_items[product_id] = cart_items.get(product_id, 1)
            self.request.session['cart_items'] = cart_items
            print(f"post : {time.time() - start_time}")  
            return render(request, self.template_name, context)
            
        elif 'item_id' in request.POST:  # 데이터를 삭제하는 경우
            product_id = self.request.POST.get("item_id")
            print("this is product id : ", product_id)
            if product_id in cart_items:
                cart_items[product_id] -= 1
                if cart_items[product_id] == 0:
                    del cart_items[product_id]
            self.request.session['cart_items'] = cart_items
            print(f"post : {time.time() - start_time}")
            return render(request, self.template_name, context)
        
        else: # 데이터를 선택하는 경우
            print("fetch")
            responseData = json.loads(request.body)
            id = responseData["data"]
            print(id)
            # response_data = {"msg": "Data received"}
            detail = SeoulData.objects.filter(서비스ID=id)
            print(detail)
            serialized_data = [item.to_dict() for item in detail]
            response_data = {
                'data': serialized_data,
                'message': 'success',
            }
            return JsonResponse(response_data)
        
        # queryset = SeoulData.objects.all()
        # context = {"seouldata_list" : queryset, "datacart_list" : get_session(cart_items, SeoulData)}
        # return render(request, self.template_name, context, csrf_token)


    


# class OpenDetailView(DetailView) :
#     model = SeoulData

# class CartView(TemplateView):
#     template_name = 'web/datacart.html'

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         cart_items = self.request.session.get('cart_items', {})
#         items = []
#         for product_id, quantity in cart_items.items():
#             product = SeoulData.objects.get(id=product_id)
#             items.append({
#                 'service_id': product.서비스ID,
#                 'product': product.서비스명,
#                 'category': product.소분류,
#                 "product_id": product_id
#             })
#         context['items'] = items
#         return context

# class RemoveCart(View):
#     template_name = "web/seouldata_list.html"

#     def get(self, request):
#         cart_items = self.request.session.get('cart_items', {})
#         seouldata_queryset = SeoulData.objects.all()
#         datacart_items = get_session(cart_items, SeoulData)

#         context = {"seouldata_list": seouldata_queryset,
#                    "datacart_list": datacart_items}
#         print("@@@@@@@", datacart_items)
#         return render(request, self.template_name, context)

#     def post(self, request):
#         product_id = self.request.POST.get("item_id")
#         print("this is product id : ", product_id)
#         cart_items = self.request.session.get('cart_items', {})
#         print("!!!!!!!!!", cart_items)
#         if product_id in cart_items:
#             cart_items[product_id] -= 1
#             if cart_items[product_id] == 0:
#                 del cart_items[product_id]
#         self.request.session['cart_items'] = cart_items
#         return redirect("/web/list/")


