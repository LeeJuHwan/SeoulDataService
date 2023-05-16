from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.MainView.as_view(), name="main"),
    path("li/", views.ChangeListView.as_view(), name="toggle_list"),
    path("list/", views.OpenDataView.as_view(), name="list-page"),
    path('node-coordinate/', views.node_coordinate, name='total_json'),
    # path("test", views.Test.as_view()),
]
