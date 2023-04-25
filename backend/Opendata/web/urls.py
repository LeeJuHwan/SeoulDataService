from django.urls import path
from . import views

app_name = "web"

urlpatterns = [
    path("", views.MainView.as_view(), name = "main"),
    # path("car/", views.CarFormView.as_view(), name = "car"),
    # path("create_car/", views.CarCreateView.as_view(), name = "car-create"),
    path("list/", views.OpenListView.as_view(), name = "list-page"),
    path("detail_car/<int:pk>", views.OpenDetailView.as_view(), name = "car-detail"),
    # path("update_car/<int:pk>", views.CarUpdateView.as_view(), name = "car-update"),
    # path("delete_car/<int:pk>", views.CarDeleteView.as_view(), name = "car-delete"),
]