import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import pandas as pd
from tqdm import tqdm


class Name:
    def __init__(self):
        self.data = []
        self.datas = []
        self.setting()
        self.df_total = pd.DataFrame()

    def setting(self):
        load_dotenv()
        self.opendata_key = os.getenv("opendata_key")

    def set_url(self, params):
        url = 'http://openAPI.seoul.go.kr:8088/'
        for v in params.values():
            url += f'{v}/'
        return url

    def set_params(self, **kwargs) -> dict:
        res = {}
        for name, value in kwargs.items():
            res[name] = value
        return res

    def get_APItojson(self, params: dict):
        res = []
        get_url = self.set_url(params)
        response = requests.get(get_url).json()
        res += response[params['SERVICE']]['row']
        return res

    def get_start_end(self, start, end):

        pass

    def sss(self, **kwargs):
        pass
