from django.shortcuts import render

from rest_framework.viewsets import ModelViewSet
from api.serializers import PreprocessedImageSerializer
from api.models import PreprocessedImages


class PreprocessedImageViewSets(ModelViewSet):
    queryset = PreprocessedImages.objects.all()
    serializer_class = PreprocessedImageSerializer
