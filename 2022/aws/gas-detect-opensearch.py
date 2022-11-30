import json
import requests
from requests.auth import HTTPBasicAuth
import boto3
import datetime
from pytz import timezone
import contants
from urllib import parse
 
client = boto3.client(
        'iot-data', 
        region_name = 'ap-northeast-2', 
        endpoint_url = 'https://a26pnpi3qj130t-ats.iot.ap-northeast-2.amazonaws.com')
        
def publish_to_iot_core(data):

    now = datetime.datetime.now(timezone('Asia/Seoul'))
    nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')

    data['date'] = nowDatetime;
    
    return data;
    
def lambda_handler(event, context):
    print 
    headers = { 
        'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Content-Type': 'application/json'
    };
    auth = HTTPBasicAuth('ID','PW');

    if event['method'] == "GET":
        url = 'OPEN-SEARCH-URL'+ event['index'] + '/_search';
        r = requests.get(url, headers=headers,auth=auth, data=event['query'])
        result = r.text

    if event['method'] == "POST":
        url = 'OPEN-SEARCH-URL'+ event['index'] + '/_doc';
        data = json.loads(event["body"]);
        publish_to_iot_core(data);
        result = requests.post(url = url, data = json.dumps(data), headers = headers, auth = auth).json();

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': result
    }
