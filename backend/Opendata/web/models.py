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
        
    def to_dict(self):
        return {
            "서비스ID":self.서비스ID,
            "서비스명":self.서비스명,
            "대분류":self.대분류,
            "중분류":self.중분류,
            "소분류":self.소분류,
            "제공기관":self.제공기관,
            "제공부서명":self.제공부서명,
            "시스템명":self.시스템명,
            "담당자명":self.담당자명,
            "담당자연락처":self.담당자연락처,
            "갱신주기":self.갱신주기,
            "최종갱신일자":self.최종갱신일자,
            "제공사이트":self.제공사이트,
            "제공형식":self.제공형식,
            "서비스설명":self.서비스설명,
            "urls":self.urls
        }


