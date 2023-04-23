from django.db import models

# class User(models.Model):
#     id = models.IntegerField(primary_key=True) 
#     name = models.CharField(max_length=100)
#     passwd = models.CharField(max_length=500)
#     email = models.CharField(max_length=100)
#     profile_name = models.CharField(max_length=100)


# class Subcategory(models.Model):
#     category_name = models.CharField(max_length=100)

    # class Meta() :
    #         db_table = "subcategory"
# """
# ['서비스ID', '서비스명', '대분류', '중분류', '소분류', '제공기관', '제공부서명', '시스템명', '담당자명',
#        '담당자연락처', '갱신주기', '최종갱신일자', '제공사이트', '제공형식', '서비스설명', 'urls']
# """
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

# class SeoulData(models.Model):
#     service_id = models.IntegerField()
#     service_name = models.CharField(max_length=500)
#     category = models.CharField(max_length=100)
#     provider = models.CharField(max_length=100)
#     # subcategory = models.ForeignKey(Subcategory, on_delete=models.CASCADE)
#     subcategory = models.CharField(max_length=100)
#     agency = models.CharField(max_length=100)
#     department = models.CharField(max_length=100)
#     system = models.CharField(max_length=500)
#     contact_person = models.CharField(max_length=100)
#     contact_phone = models.CharField(max_length=100)
#     renewal_cycles = models.CharField(max_length=100)
#     last_renewal_date = models.DateTimeField()
#     serving_sites = models.CharField(max_length=500)
#     delivery_format = models.CharField(max_length=100)
#     service_url = models.CharField(max_length=500)
#     data_info = models.CharField(max_length=5000)

#     class Meta() :
#         db_table = "seoul_data"

class Datacart(models.Model):
    seoul_data = models.ForeignKey(SeoulData, on_delete=models.CASCADE)
    add_date = models.DateTimeField(auto_now_add=True)

    class Meta():
        db_table = "data_cart"
        ordering = ["-add_date"]

