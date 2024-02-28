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
        endpoint_url = 'IOT코어URL')
        
def publish_to_iot_core(data):

    now = datetime.datetime.now(timezone('Asia/Seoul'))
    nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')

    # if "iot_core" in data :
    #     res = client.publish(
    #         topic = 'pi/1', qos = 1, payload = json.dumps({ "iot_core": "iot_core" }))
    
    # elif "emergency" in data :
    #     res = client.publish(
    #         topic = 'pi/1', qos = 1, payload = json.dumps({ "emergency": "emergency" }))
    
    # elif "co" in data and "nh3" in data and "no2" in data :
    #     msg = 'success'
    #     if("co" in data) :
    #         value_co = float(data['co']['value'])
    #         if(value_co >= contants.CO) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "co warning"}))
    #     if("no2" in data) :
    #         value_no2 = float(data['no2']['value'])
    #         if(value_no2 >= contants.NO2) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "no2 warning"}))
    #     if("c2h5oh" in data) :
    #         value_c2h5oh = float(data['c2h5oh']['value'])
    #         if(value_c2h5oh >= contants.C2H50H) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "c2h5oh warning"}))
    #     if("h2" in data) :
    #         value_h2 = float(data['h2']['value'])
    #         if(value_h2 >= contants.H2) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "h2 warning"}))
    #     if("nh3" in data) :
    #         value_nh3 = float(data['nh3']['value'])
    #         if(value_nh3 >= contants.NH3) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "nh3 warning"}))
    #     if("ch4" in data) :
    #         value_ch4 = float(data['ch4']['value'])
    #         if(value_ch4 >= contants.CH4) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "ch4 warning"}))
    #     if("c3h8" in data) :
    #         value_c3h8 = float(data['c3h8']['value'])
    #         if(value_c3h8 >= contants.C3H8) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "c3h8 warning"}))
    #     if("c4h10" in data) :
    #         value_c4h10 = float(data['c4h10']['value'])
    #         if(value_c4h10 >= contants.C4H10) :
    #             res = client.publish(
    #                 topic = 'pi/1', qos = 1, payload = json.dumps({"warning": "c4h10 warning"}))
                    
    #     if("temperature" in data) :
    #         value_temperature = float(data['temperature']['value'])
    #     if("humidity" in data) :
    #         value_humidity = float(data['humidity']['value'])
    #     if("barometer" in data) :
    #         value_barometer = float(data['barometer']['value'])
            
    #     res = client.publish(
    #         topic = 'pi/1', qos = 1, payload = json.dumps({"msg": msg}))

    data['date'] = nowDatetime;
    
    return data;
    
def lambda_handler(event, context):
    print 
    headers = { 
        # 'authorization': 'Basic ',
        'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Content-Type': 'application/json'
    };
    auth = HTTPBasicAuth('오픈서치유저아이디','비밀번호');

    if event['method'] == "GET":
        url = '오픈서치URL'+ event['index'] + '/_search';
        r = requests.get(url, headers=headers,auth=auth, data=event['query'])
        result = r.text

    if event['method'] == "POST":
        url = '오픈서치URL'+ event['index'] + '/_doc';
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