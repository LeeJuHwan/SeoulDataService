import requests
import os
from dotenv import load_dotenv
import pandas as pd
import re
from tqdm import tqdm
from datetime import datetime

class GetData:
    def __init__(self):
        self.data = []
        self.datas = []
        self.temp = []
        self.setting()
        self.df_total = pd.DataFrame()
        self.df_column = pd.DataFrame()
        #현재 시작
        self.today = str(datetime.now().date())
        
    def setting(self):
        load_dotenv()
        self.key = os.getenv("opendata_key")
        
    def crawling1(self, api_num):
        for num in range(api_num):
            url = f'http://openAPI.seoul.go.kr:8088/{self.key}/json/SearchCatalogService/{num}000/{num}999/'
            req= requests.get(url).json()
            self.data += req['SearchCatalogService']['row']
                
    def crawling2(self):        
        for num in tqdm(range(17)):
            url = f'http://openAPI.seoul.go.kr:8088/{self.key}/json/SearchOpenDataServiceList/{num}000/{num}999/'
            req= requests.get(url).json()
            try:
                self.datas += req['SearchOpenDataServiceList']['row']
            except:
                pass
    def crawling3(self):
        self.serviceId= self.df_total[self.df_total['최종갱신일자']==self.today]['서비스ID'].tolist()
        
        for i in tqdm(serviceId):
            url = f'http://openAPI.seoul.go.kr:8088/{self.key}/json/SearchOpenAPIIOValueService/1/5/{i}/'
            req = requests.get(url).json()
            try:
                self.temp.append(req['SearchOpenAPIIOValueService']['row'])
            except:
                pass
        self.temp = sum(self.temp,[])
        print(self.temp)
        self.df_column = pd.DataFrame(self.temp)
        self.update()
        
    def dataMerge(self):
        ##1 
        df = pd.DataFrame(self.data)
        df.rename({'INF_ID':'서비스ID','INF_NM':'서비스명','CATE_NM':'대분류','DITC_NM':'중분류','MAP_CATE_NM':'소분류','MNG_ORGAN_NAME':'제공기관',
         'MNG_STATION_NAME':'제공부서명','LINK_DESC':'시스템명','MANAGER_NAME':'담당자명','MANAGER_PHONE':'담당자연락처',
         'CHNG_LOAD_NM':'갱신주기','DATA_LT_NM':'최종갱신일자','LINK_INFO':'제공사이트','SRV_TYPE':'제공형식','SHORT_URL':'서비스URL'},axis = 1, inplace = True)
        df.drop_duplicates(subset = '서비스명', inplace = True)
        print(f"서울시 개방현황: 총 {len(df)}개 입니다.")
        ##2
        df2 = pd.DataFrame(self.datas)[['INF_NM','INF_EXP']]
        df2.rename({'INF_NM':'서비스명','INF_EXP':'서비스설명'},axis = 1,inplace = True)
        df2.drop_duplicates(subset = '서비스명', inplace = True)
        print(f"서울시 서비스: 총 {len(df2)}개 입니다.")
        
        ##3
        self.df_total = pd.merge(df,df2,on = '서비스명')
        print(f"서울시 공공데이터: 총 {len(self.df_total)}개 입니다.")
        
        return self.df_total
    
    def changeurl(self,s):
        return f"https://data.seoul.go.kr/dataList/{s}/S/1/datasetView.do"
    
    def remove_tags(self,text):
        cleaned_text = re.sub('<.*?>', '', str(text))
        return cleaned_text
    
    def dataPreprocessing(self):
        self.df_total.drop(['서비스URL'], axis = 1, inplace = True)
        self.df_total['urls'] = self.df_total['서비스ID'].apply(self.changeurl)
        self.df_total['서비스설명'] = self.df_total['서비스설명'].replace({'<a href=': ''},regex= True)
        self.df_total['서비스설명'] = self.df_total['서비스설명'].replace({'\r':'','\n':''}, regex = True)
        self.df_total['서비스설명'] = self.df_total['서비스설명'].apply(self.remove_tags)
        self.df_total['서비스설명'] = self.df_total['서비스설명'].replace({'>':''},regex= True)
        
        #값 저장
        self.df_total.to_csv('서울시 공공데이터 최종.csv',index = False)
    
    def update(self):
        df = pd.read_csv('서울시 공공데이터 데이터 칼럼 설명.csv')
        df.update(self.df_column)
        df.to_csv('서울시 공공데이터 데이터 칼럼 설명.csv',index = False)
        
        
    def total_result(self):
            if len(self.serviceId) > 0:
                return True
            else:
                return False
        
    def getapi(self,api_num = 1): # api_num =8주면 보통 다 크롤링 해온다.
        self.crawling1(api_num) # 서울시 개방현황
        self.crawling2() # 서울시 서비스 현황
        self.dataMerge() # 데이터 합치기
        self.dataPreprocessing() # url만들기 및 태그 전처리
        self.crawling3() # 서울시 칼럼
        
        self.total_result() # 최종 결과...????