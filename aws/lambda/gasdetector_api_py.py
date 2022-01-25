import json
import boto3
import requests
import datetime
from pytz import timezone

client = boto3.client('iot-data', region_name='ap-northeast-2', endpoint_url='')    #set iot-core endpoint

def lambda_handler(event, context):
    # TODO implement
    now = datetime.datetime.now(timezone('Asia/Seoul'))
    nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')
    
    url = ''    # set opensearch endpoint
    
    #event에 iot_core가 있을 시 iot_core 메세지 전달
    if "iot_core" in event :
        res = client.publish(
            topic = 'pi/1',
            qos = 1,
            payload = json.dumps({"iot_core": "iot_core"})
        )
    #event에 emergency가 있을 시 emergency 메세지 전달
    elif "emergency" in event :
        res = client.publish(
            topic = 'pi/1',
            qos = 1,
            payload = json.dumps({"emergency": "emergency"})
        )
    #event에 co, nh3, no2가 있을 시
    elif "co" in event and "nh3" in event and "no2" in event :
        msg = 'success'
        if("co" in event) :
            value_co = float(event['co']['value'])
            #event.co.value 값이 1805가 넘어가면 warning 전달
            if(value_co >= 1805) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "co warning"})
                )
        if("no2" in event) :
            value_no2 = float(event['no2']['value'])
            if(value_no2 >= 88) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "no2 warning"})
                )
        if("c2h5oh" in event) :
            value_c2h5oh = float(event['c2h5oh']['value'])
            if(value_c2h5oh >= 20000) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "c2h5oh warning"})
                )
        if("h2" in event) :
            value_h2 = float(event['h2']['value'])
            if(value_h2 >= 7500) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "h2 warning"})
                )
        if("nh3" in event) :
            value_nh3 = float(event['nh3']['value'])
            if(value_nh3 >= 2500) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "nh3 warning"})
                )
        if("ch4" in event) :
            value_ch4 = float(event['ch4']['value'])
            if(value_ch4 >= 500000) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "ch4 warning"})
                )
        if("c3h8" in event) :
            value_c3h8 = float(event['c3h8']['value'])
            if(value_c3h8 >= 570000) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "c3h8 warning"})
                )
        if("c4h10" in event) :
            value_c4h10 = float(event['c4h10']['value'])
            if(value_c4h10 >= 520400) :
                res = client.publish(
                    topic = 'pi/1',
                    qos = 1,
                    payload = json.dumps({"warning": "c4h10 warning"})
                )
        if("temperature" in event) :
            value_temperature = float(event['temperature']['value'])
        if("humidity" in event) :
            value_humidity = float(event['humidity']['value'])
        if("barometer" in event) :
            value_barometer = float(event['barometer']['value'])
              
        res = client.publish(
            topic = 'pi/1',
            qos = 1,
            payload = json.dumps({"msg": msg})
        )
    data = json.loads(event['body'])
    data['date'] = nowDatetime
    headers = {'Content-type': 'application/json'}
    response = requests.post(url, data = json.dumps(data), headers=headers, auth=('crc', event['headers']['crc'])).json()
    return response