import json
import requests
import datetime
from pytz import timezone

# humidity 들어오는 값들을 처리하기 위한 코드

def lambda_handler(event, context):
    # date 저장을 위한 변수
    now = datetime.datetime.now(timezone('Asia/Seoul'))
    nowDatetime = now.strftime('%Y-%m-%dT%H:%M:%S')
    
    url = ''    # set opensearch endpoint
    
    # humidity 로 받은 값을 json화 시키고 현재 시간 값 넣어서 post
    data = json.loads(event['body'])
    data['date'] = nowDatetime
    headers = {'Content-type': 'application/json'}
    
    # auth값은 헤더의 값 참조
    response = requests.post(url, data = json.dumps(data), headers=headers, auth=('crc', event['headers']['crc'])).json()
    return response