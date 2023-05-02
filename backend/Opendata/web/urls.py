from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.MainView.as_view(), name = "main"),
    path("list/", views.OpenDataView.as_view(), name = "list-page"),
]