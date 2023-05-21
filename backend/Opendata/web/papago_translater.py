import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()
client_id = os.environ.get("client_id")
client_secret = os.environ.get("client_secret")


def trans(text_list: list) -> list:
    """파파고 API 호출 및 텍스트 번역"""
    result = []
    for i in range(len(text_list)):
        encText = urllib.parse.quote(text_list[i])
        data = "source=en&target=ko&text=" + encText
        url = "https://openapi.naver.com/v1/papago/n2mt"
        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", client_id)
        request.add_header("X-Naver-Client-Secret", client_secret)
        response = urllib.request.urlopen(request, data=data.encode("utf-8"))
        rescode = response.getcode()
        if rescode == 200:
            response_body = response.read()
            # print(eval(response_body.decode("utf-8")))
            result.append(
                eval(response_body.decode("utf-8"))["message"]["result"][
                    "translatedText"
                ]
            )
        else:
            return "Error Code:" + rescode
    return result


if __name__ == "__main__":
    text = [
        '"\\"Optimizing Classroom Space in Seoul\'s Kindergartens: A Case Study in Seocho-gu\\""',
        '"\\"Exploring the Relationship between Classroom Size and Learning Outcomes in Seoul\'s Kindergartens\\""',
        '"\\"Innovative Design Solutions for Kindergarten Classrooms in Seocho-gu\\""',
        '"\\"A Comparative Study of Kindergarten Facilities in Seoul\'s Different Districts: Implications for Policy and Practice\\""',
        '"\\"The Impact of Outdoor Play Spaces on Early Childhood Development: A Study of Seocho-gu\'s Kindergartens\\""',
    ]
    print(trans(text))
