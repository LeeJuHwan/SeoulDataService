# Web Application Server

### WebPage
> GET 
```
http://3.39.242.243:8000/
```


### :muscle: 이런 문제를 마주 하고, 이렇게 해결하였습니다.
---
> **AWS EC2 인스턴스**
- 초기 인스턴스 유형: t3 large - 8GB 리소스 할당
  - __"No space left on device error"__ -> 도커 빌드하는 과정에서 발생

    - **문제**: 용량 부족 현상:scream:

    - **해결**
      - 디스크 용량 확인

        ```
        df -h
        ```
        - 디스크 용량을 확인한 사진은 없었지만, /dev/root 폴더에서 7.9GB를 할당 받았지만 도커를 빌드 하는 과정에서 7.9GB를 다 사용한 것을 확인 하였습니다.
     
      - 리소스 증가
        - 8.0GB -> 24.0GB
        - 마운트 된 디스크의 할당 리스크 확인

          ```
          lsblk
          ```

       - 파티션 크기 증가
          ```
          sudo growpart nvme0n1 1
          ```
       - 파티션 사이즈 적용
          ```
          sudo resize2fs /dev/root
          ```
    - 리소스 변경 후 최종 상태

      > lsblk
      <img width="501" alt="image" src="https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/1d81dcfd-678e-4d80-ae35-91aa02325515">
      
      > df -h
      <img width="572" alt="image" src="https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/b88f3ec0-f06f-4d09-b137-bf6d960695d2">
      
      - 현재는 20GB 만큼 사용 하고 있고, 4.1GB의 여유가 있는 것을 확인 할 수 있었습니다.

> **도커**
  - 도커 이미지 관리
    - 위에 AWS EC2에 도커를 설치 하고, 실행 도중 컨테이너를 모두 내리고, 이미지를 새롭게 빌드를 하는 과정에서 이미지의 용량으로 인해 빌드 실패를 겪었습니다.
      - 우선, 이미지 용량이 얼만큼 차지 하고 있는지 확인이 필요 하였습니다.

        ```
         docker system df
        ```

        <img width="611" alt="image" src="https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/239c07ef-b3f8-4a55-9a8c-fd7a27bb44f8">
        
      - 우선, 컨테이너를 내렸고 이미지를 새롭게 빌드 하고 싶었기 때문에 이미지를 모두 지워줬습니다.

        ```
        docker rmi <image>
        ```

      - 위에서 확인 했던 캐쉬도 깔끔하게 지웠습니다.

        ```
        docker system prune
        ```
      - 다시 새롭게 도커 빌드 시작

        <img width="767" alt="image" src="https://github.com/LeeJuHwan/SeoulDataService/assets/118493627/558161fe-477e-4e29-b244-298163b715a7">
        
        - 위의 일련 과정을 겪은 후 서버가 정상적으로 실행이 될 수 있었습니다.
