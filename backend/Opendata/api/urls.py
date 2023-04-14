from rest_framework import routers
from django.urls import path
from api import views

router = routers.SimpleRouter()
router.register('preprocessed_image', views.PreprocessedImageViewSets)

urlpatterns = [
    # path('some_functional_view_rul', views.functional_view)
]
urlpatterns += router.urls