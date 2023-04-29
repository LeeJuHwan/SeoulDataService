from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.MainView.as_view(), name = "main"),
    path("cart/", views.CartView.as_view(), name = "cart"),
    # path("cart/add/<int:pk>", views.AddToCartView.as_view(), name = "create-page"),
    # path("list/", views.OpenListView.as_view(), name = "list-page"),
    path("list/", views.OpenDataView.as_view(), name = "list-page"),
    path("detail/<int:pk>", views.OpenDetailView.as_view(), name = "detail-page"),
    path("delete/<int:pk>", views.RemoveFromCartView.as_view(), name = "remove_from_cart"),
]