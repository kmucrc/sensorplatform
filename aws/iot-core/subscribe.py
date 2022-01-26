import requests
import time, json, ssl
import paho.mqtt.client as mqtt
import random
from json import dumps


ENDPOINT = ''   # set iot-core endpoint
THING_NAME = '' # set iot thing name

#set subscription address
sub = ''

def on_connect(mqttc, obj, flags, rc):
        if rc == 0:
                #alert connect
                print('connected!!')
                #subscribe
                mqttc.subscribe(sub, qos=1)
            
def on_disconnect(client, userdata, flags, rc=0):
        print(str(rc))
        
def on_subscribe(client, userdata, mid, granted_qos):
        print("subscribe")


def on_message(mqttc, obj, msg):
        #take message from lambda
        print(msg.payload)

mqtt_client = mqtt.Client(client_id=THING_NAME)
mqtt_client.on_connect = on_connect

mqtt_client.on_subscribe = on_subscribe
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

#set certifications
mqtt_client.tls_set('', certfile='',
        keyfile='', tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)

#connect
mqtt_client.connect(ENDPOINT, port=8883)
mqtt_client.loop_forever() # threaded network loop
