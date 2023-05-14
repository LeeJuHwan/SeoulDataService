import pandas as pd
from sqlalchemy import create_engine
from django.core.management.base import BaseCommand
from web.models import SeoulData, DataColumn
import psycopg2

engine = create_engine("postgresql://postgres:0000@db:5432/postgres")


def seouldata_length():
    try:
        conn = psycopg2.connect(
            host="db", dbname="postgres", user="postgres", password="0000"
        )
        cur = conn.cursor()
        cur.execute("select count(*) from seoul_data")
        return cur.fetchone()[0]

    except:
        return None


def datacolumns_length():
    try:
        conn = psycopg2.connect(
            host="db", dbname="postgres", user="postgres", password="0000"
        )
        cur = conn.cursor()
        cur.execute("select count(*) from seouldata_columns")
        return cur.fetchone()[0]
    except:
        return None


print("SEOUL", seouldata_length())
print("COLIMN", datacolumns_length())


class Command(BaseCommand):
    def handle(self, *args, **options):
        columns = [
            "INF_ID",
            "COL_ENG_NM",
            "COL_KOR_NM",
        ]

        df = pd.read_csv("/Opendata/csv_file/서울시 공공데이터 최종_reg1.csv")
        df2 = pd.read_csv("/Opendata/csv_file/data columns.csv")
        df2 = df2[columns]

        if seouldata_length() < len(df):
            print("seoul data db uploading...")
            df.to_sql(
                SeoulData._meta.db_table, if_exists="append", con=engine, index=False
            )
            print("finish db upload")
        if datacolumns_length() < len(df2):
            print("data columns db uploading...")
            df2.to_sql(
                DataColumn._meta.db_table, if_exists="append", con=engine, index=False
            )
            print("finished")
