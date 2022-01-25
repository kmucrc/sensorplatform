import json
import requests
import datetime
from pytz import timezone

def lambda_handler(event, context):
    # TODO implement
    now = datetime.datetime.now(timezone('Asia/Seoul'))
    nowDatetime = now.strftime('%Y-%m-%dT%H:%M:%S')
    
    url = ''    # set opensearch endpoint
    data = json.loads(event['body'])
    data['date'] = nowDatetime
    headers = {'Content-type': 'application/json'}
    response = requests.post(url, data = json.dumps(data), headers=headers, auth=('crc', event['headers']['crc'])).json()
    return response