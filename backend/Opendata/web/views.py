from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.views.generic.edit import FormView,  CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.detail import DetailView

from .models import SeoulData, Datacart
from django.utils import timezone

class MainView(TemplateView) :
    template_name = "web/main.html"

    def get_context_data(self, **kwargs: str) -> dict[str, str]:
        context =  super().get_context_data(**kwargs)
        context["name"] = "My project"
        return context

class OpenListView(ListView) :
    model = SeoulData
    paginate_by = 100

    queryset = SeoulData.objects.all()
    def get_context_data(self, **kwargs) : 
        context = super().get_context_data(**kwargs)
        context["now"] = timezone.now()
        return context

class OpenDetailView(DetailView) :
    model = SeoulData

from django.views.generic import TemplateView
from django.shortcuts import redirect

class CartView(TemplateView):
    template_name = 'web/datacart.html'

    def get(self, request, *args, **kwargs):
        cart_data = request.session.get('cart', {})
        context = {'cart_data': cart_data}
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        seoul_data_id = request.POST.get('seoul_data_id')
        if seoul_data_id:
            cart_data = request.session.get('cart', {})
            cart_data[seoul_data_id] = cart_data.get(seoul_data_id, 0) + 1
            request.session['cart'] = cart_data
        return redirect('cart')

