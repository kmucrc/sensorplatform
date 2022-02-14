import requests
from json import dumps


# 라즈베리파이에서 수집된 값을 전달하기 위한 파일

# 헤더 값은 content-type과 opensearch에 값 저장을 위한 key-password가 담겨야 한다.
headers = { 'Content-Type': 'application/json'}

# payload 변수에는 라즈베리파이에서 수집한 값을 담는다.
payload = { "test": "test" }    #set data

# json처리를 위함
payload = dumps(payload)

# api-gateway endpoint로 값을 post 함
r = requests.post('',   #set api-gateway endpoint
                  headers=headers, data=payload)