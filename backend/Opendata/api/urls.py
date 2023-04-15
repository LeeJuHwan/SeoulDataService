from rest_framework import routers
from django.urls import path
from api import views

router = routers.SimpleRouter()
router.register('preprocessed_image', views.PreprocessedImageViewSets)

urlpatterns = [
    
]
urlpatterns += router.urls