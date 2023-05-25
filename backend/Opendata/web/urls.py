from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.MainView.as_view(), name="main"),
    path("node-coordinate/", views.node_coordinate, name="total_json"),
]
