import pandas as pd
from sqlalchemy import create_engine
from django.core.management.base import BaseCommand
from web.models import SeoulData 
import psycopg2

conn = psycopg2.connect(host="db", dbname="postgres", user="postgres", password="0000")
cur = conn.cursor()
cur.execute("select count(*) from seoul_data")
data_count = cur.fetchone()[0]

class Command(BaseCommand):
    def handle(self, *args, **options):
        columns = [
                    "service_id","service_name","category","provider","sub_category","agency"
                    "department","system","contact_person","contact_phone","renewal_cycles",
                    "last_renewal_date","serving_sites","delivery_format","service_url","data_info"
                ]
        # columns = ['서비스ID', '서비스명', '대분류', '중분류', '소분류', '제공기관', '제공부서명', '시스템명', '담당자명',
                    # '담당자연락처', '갱신주기', '최종갱신일자', '제공사이트', '제공형식', '서비스설명', 'urls']
        
        df = pd.read_csv("/Opendata/csv_file/서울시 공공데이터 최종.csv")
        if data_count < len(df): 
            print(f"저장 되어 있는 데이터 : {data_count} 입력할 데이터 :{len(df)} > 데이터 저장 성공")
            engine = create_engine("postgresql://postgres:0000@db:5432/postgres")
            df.to_sql(SeoulData._meta.db_table, if_exists='append' ,con=engine, index=False)

    #     sub_category = ['일반행정', '산업/경제', '환경', '문화/관광', '보건', '안전', '복지', '주택/건설', '교육',
    #    '도시관리', '교통','인구/가구']

    #     sub_df = pd.DataFrame(sub_category, columns = ["category_name"])
    #     sub_df.to_sql(Subcategory._meta.db_table, if_exists='append' ,con=engine, index=False)