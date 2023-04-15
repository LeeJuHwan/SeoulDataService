from django.db import models

from djongo import models

class PreprocessedImages(models.Model):
    image_id = models.AutoField(primary_key=True)  # 나중에 수정할 부분입니다!
    image_title = models.TextField(null=True, default="a.jpg")
    image_path = models.FilePathField(null=False, default="/home/fffcoder/ocrandnlp/images/a.jpg")
    image_context = models.TextField(null=False, default="일방통행")

    class Meta:
        db_table = "preprocessed_images"
