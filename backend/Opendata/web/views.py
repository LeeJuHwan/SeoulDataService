from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, RedirectView
from django.views.generic.edit import FormView,  CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views import View
from .models import SeoulData, Datacart
from django.utils import timezone

class MainView(TemplateView) :
    template_name = "web/main.html"
    
    def get_context_data(self, **kwargs: str) -> dict[str, str]:
        context =  super().get_context_data(**kwargs)
        context["name"] = "My project"
        return context

class OpenDataView(View):
    """Project data list and cart product."""
    template_name = "web/seouldata_list.html"

    def get(self, request):
        """Connect urls."""
        # del request.session['cart_items']
        seouldata_queryset = SeoulData.objects.all()
        cart_items = self.request.session.get('cart_items', {})
        print("cart_items", cart_items)
        datacart_items = []
        for product_id, _ in cart_items.items():
            product = SeoulData.objects.get(id=product_id)
            datacart_items.append({
                'service_id': product.서비스ID,
                'product': product.서비스명,
                'category': product.소분류,
                "product_id": product_id
                })
        context = {"seouldata_list" : seouldata_queryset,
                    "datacart_list" : datacart_items}
        
        return render(request, self.template_name, context)

        
        # items = []
        # for product_id, quantity in cart_items.items():
        #     product = SeoulData.objects.get(id=product_id)
        #     items.append({
                # 'service_id': product.서비스ID,
                # 'product': product.서비스명,
                # 'category': product.소분류,
                # "product_id": product_id
        #     })
        # context['items'] = items

    def post(self, request):
        """Submit data."""
        cart_items = self.request.session.get('cart_items', {})
        id_list = self.request.POST.getlist("selected_items")
        print(id_list)
        for product_id in id_list:
            cart_items[product_id] = cart_items.get(product_id, 1)
        self.request.session['cart_items'] = cart_items  

        queryset = SeoulData.objects.all()
        context = {"object_list": queryset, "cart_items": cart_items}
        # print("####", self.request.session['cart_items'])
        return render(request, self.template_name, context)

      

        # cart = request.session.get('cart', [])
        # selected_items = request.POST.getlist('selected_items')
        # print("selected_item : ", selected_items)
        # for item_id in selected_items:
        #     item = SeoulData.objects.get(pk=item_id)
        #     cart.append({
        #         'service_id': item.서비스ID,
        #         'product': item.서비스명,
        #         'category': item.소분류,
        #         "product_id": item_id})
        # request.session['cart'] = cart


# class OpenListView(ListView) :
#     model = SeoulData
#     paginate_by = 100

#     queryset = SeoulData.objects.all()
#     def get_context_data(self, **kwargs) : 
#         context = super().get_context_data(**kwargs)
#         context["now"] = timezone.now()
#         return context

class OpenDetailView(DetailView) :
    model = SeoulData

class CartView(TemplateView):
    template_name = 'web/datacart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart_items = self.request.session.get('cart_items', {})
        items = []
        for product_id, quantity in cart_items.items():
            product = SeoulData.objects.get(id=product_id)
            items.append({
                'service_id': product.서비스ID,
                'product': product.서비스명,
                'category': product.소분류,
                "product_id": product_id
            })
        context['items'] = items
        return context

# class AddToCartView(RedirectView):
#     def get_redirect_url(self, *args, **kwargs):
#         product_id = self.kwargs.get('pk')
#         cart_items = self.request.session.get('cart_items', {})
#         cart_items[product_id] = cart_items.get(product_id, 0) + 1
#         self.request.session['cart_items'] = cart_items
#         return '/web/cart/'

class RemoveFromCartView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        product_id = str(self.kwargs.get('pk'))
        cart_items = self.request.session.get('cart_items', {})
        if product_id in cart_items:
            cart_items[product_id] -= 1
            print(cart_items)
            if cart_items[product_id] == 0:
                del cart_items[product_id]
        self.request.session['cart_items'] = cart_items
        return "/web/list/"