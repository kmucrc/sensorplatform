import boto3, json
client = boto3.client('lambda', region_name="ap-northeast-2")

def invokePrivateLambda(payload):
  r = client.invoke(
    FunctionName='gasdetector_api_py',
    InvocationType='RequestResponse',
    Payload=bytes(payload, encoding='utf-8')
  )
  return r['Payload'].read().decode('utf-8')
  
def lambda_handler(event, context):
    method = event['httpMethod']
    
    if method == 'POST':
        body = event['body']
        index = event['headers']['index']
        payload = json.dumps({'body': body, 'method': method, 'index': index})
        response = invokePrivateLambda(payload)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': response
        }
        
    elif method == 'GET':
        index = event["queryStringParameters"]['index']
        query = event["queryStringParameters"]['query']
        payload = json.dumps({'query':query, 'method': "GET", 'index': index })
        response = invokePrivateLambda(payload)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': response
        }
        
    return {
        'statusCode': 400,
        'body': json.dumps('Invalid_Access')
    }
