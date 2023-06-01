# 서울시 열린 데이터 웹 / 앱 서비스 공모전 2023
[![image](https://user-images.githubusercontent.com/118493627/230771019-846ead77-1796-4896-980f-7d84a3f8591b.png)](https://data.seoul.go.kr/#)
---
### 서비스 주소
- [웹 페이지](http://3.39.242.243:8000/web/)
---
### 팀 구성

  :point_right: **프로젝트 참여 인원**
  |이름|파트|프로필|
  |:---|:---:|:---:|
  |김택관|GPT API 호출, FAISS 유사 데이터 생성, AWS 구축|[깃허브](https://github.com/KimTaekGwan)|
  |고건영|데이터 수집 및 전처리, 3D 그래프 생성|[깃허브](https://github.com/goodyoung)|
  |강지원|프론트 - 백엔드 서버 통신, UI 디자인|[깃허브](https://github.com/kanggeowon)|
  |김병진|3D 그래프 생성, 프론트엔드 기능 구현|[깃허브](https://github.com/0BackFlash0)|
  |이주환|웹 어플리케이션 서버 기능 구현|[깃허브](https://github.com/LeeJuHwan)|
   
:date:   **수행기간** 
- **4.9 ~ 5.31**
  - 주 1회 온라인 구글 미팅
  - 깃 허브 - 노션을 통해 프로젝트 관리 및 소통
    
:computer: **작업 환경**
  ||Library|
  |------|---|
  |**WAS**|**Python 3.10**(**Django**)
  |**FE**|**JavaScript(3D-Force-Grpah)**
  |**Deploy**|**AWS EC2** + **Docker**
  |**Database**|**PostgreSQL** + **FAISS**
  |**Use API**|**서울 열린데이터 광장**, **Open AI**, **Naver Papago**
---
### 프로젝트 배경
![image](https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/68cc4fbe-cee4-4758-93d6-e3e9aa430efb)


### IA
![image](https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/ac4f9cb0-10e1-41eb-87b4-247ed6756df2)

### 서비스 기능
> ### 데이터 설명
![image](https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/c9645447-a754-4d50-8b89-ff3d41d809e7)

> ### 사이드바 설명
![image](https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/b6e6c866-84ae-4641-9d86-ed3341d9c288)

![image](https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/97484bf3-fc7a-4218-ae80-d1f19e293678)


### 결론 - 프로젝트 요약
사용자 중심의 공공데이터 포털을 만드는 것, 의사결정을 도울 수 있는 생성 AI를 도입 하여 아이디어의 확장을 돕는 서비스를 목표로 하였다.

1. 브레인스토밍
2. 사용자 입력 데이터 외에 유사데이터 제공
3. 데이터 시각화
4. 사용자 친화적인 그래프 생성

### 프로젝트에 참고한 자료들
- [3d-graph-force](https://github.com/vasturiano/3d-force-graph/)
- [Celery](https://velog.io/@ssssujini99/EC2-Docker-Django-Celery-RabbitMQ-EC2-Docker-환경에서-Celery-세팅-및-테스트)
- [Django](https://docs.djangoproject.com/en/4.2/topics/class-based-views/)
- [Redis](https://github.com/jazzband/django-redis)
- [PostgreSQL](https://velog.io/@chaeri93/Django-Django%EC%99%80-Postgresql-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0)
- [AWS 용량부족 에러](https://velog.io/@ssssujini99/EC2ServerDocker-EC2-%EC%9A%A9%EB%9F%89-%EA%BD%89-%EC%B0%BC%EC%9D%84-%EB%95%8C-%ED%95%B4%EA%B2%B0%EB%B0%A9%EB%B2%95-No-space-left-on-device-%ED%95%B4%EA%B2%B0)

### 프로젝트 회고
- [블로그](https://velog.io/@1eejuhwany/%EC%84%9C%EC%9A%B8%EC%97%B4%EB%A6%B0%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%9B%B9-%EC%95%B1-%EA%B3%B5%EB%AA%A8%EC%A0%84-%EC%B0%B8%EA%B0%80-%EB%B0%8F-%ED%9A%8C%EA%B3%A0)

### Backend
- [Wep Application Server](./backend/README.md)

### OpenAI
- [GPT](./GPT/README.md)

