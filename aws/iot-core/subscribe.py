import requests
import time, json, ssl
import paho.mqtt.client as mqtt
import random
from json import dumps

# 라즈베리파이에서 메세지, warning을 받기 위한 파일

ENDPOINT = ''   # set iot-core endpoint
THING_NAME = '' # set iot thing name

# set subscription address (ex. pi/1)
sub = ''

# connect가 완료 되었을 때 구독을 해주는 함수
def on_connect(mqttc, obj, flags, rc):
        if rc == 0:
                #alert connect
                print('connected!!')
                #subscribe
                mqttc.subscribe(sub, qos=1)
            
# disconnect 시 메세지를 띄워주는 함수
def on_disconnect(client, userdata, flags, rc=0):
        print(str(rc))
        
# subscribe가 제대로 완료 되었을 때 메세지를 띄워주는 함수
def on_subscribe(client, userdata, mid, granted_qos):
        print("subscribe")

# 메세지를 수신했을 때 print해주는 함수
def on_message(mqttc, obj, msg):
        # take message from iot-core
        print(msg.payload)

# mqtt 통신을 이용해 iot-core에 등록된 기기와 연결 및 함수 지정
mqtt_client = mqtt.Client(client_id=THING_NAME)
mqtt_client.on_connect = on_connect
mqtt_client.on_subscribe = on_subscribe
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

# 인증서 설정 AmazonRootCA1 / certifile - certificate.pem / keyfile - private.pem
mqtt_client.tls_set('', certfile='',
        keyfile='', tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)

# port를 8883으로 지정하여 iot-core endpoint와 연결
mqtt_client.connect(ENDPOINT, port=8883)
mqtt_client.loop_forever() # threaded network loop - 강제종료하기 전까지 계속 실행
