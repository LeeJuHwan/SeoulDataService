from rest_framework import serializers
from api.models import PreprocessedImages


class PreprocessedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreprocessedImages
        # fields = '__all__'
        fields = ["image_title", "image_context"]
        read_only_fields = ["image_id"]