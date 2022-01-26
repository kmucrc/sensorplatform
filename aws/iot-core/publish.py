import requests
from json import dumps


headers = { 'Content-Type': 'application/json'}
payload = { "test": "test" }    #set data
payload = dumps(payload)

r = requests.post('',   #set api-gateway endpoint
                  headers=headers, data=payload)