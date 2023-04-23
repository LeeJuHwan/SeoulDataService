from django.db import models


class SeoulData(models.Model):
    서비스ID = models.CharField(max_length=100)
    서비스명 = models.CharField(max_length=500)
    대분류 = models.CharField(max_length=100, null = True)
    중분류 = models.CharField(max_length=100, null = True)
    소분류 = models.CharField(max_length=100, null = True)
    제공기관 = models.CharField(max_length=100, null = True)
    제공부서명 = models.CharField(max_length=100, null = True)
    시스템명 = models.CharField(max_length=500, null=True)
    담당자명 = models.CharField(max_length=100, null = True)
    담당자연락처 = models.CharField(max_length=100, null = True)
    갱신주기 = models.CharField(max_length=100, null = True)
    최종갱신일자 = models.DateTimeField(null = True)
    제공사이트 = models.CharField(max_length=500, null = True)
    제공형식 = models.CharField(max_length=100, null = True)
    서비스설명 = models.CharField(max_length=10000, null = True)
    urls = models.CharField(max_length=5000)

    class Meta() :
        db_table = "seoul_data"


class Datacart(models.Model):
    seoul_data = models.ForeignKey(SeoulData, on_delete=models.CASCADE)
    add_date = models.DateTimeField(auto_now_add=True)

    class Meta():
        db_table = "data_cart"
        ordering = ["-add_date"]
