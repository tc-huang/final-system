import json
import get_data_functions.news_data_select as news_data_select
import get_data_functions.dailyview_person_data as dailyview_person_data


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """
    try:
        if 'path' in event:
            api_path = event["path"]
        else:
            api_path = None

        if 'queryStringParameters' in event:
            post_params = event['queryStringParameters']
        else:
            post_params = None 
        
        if api_path == "/news":
            result = news_data_select.get_time_source_title_url_news_uid()
        
        elif api_path == "/person":
            if 'category' in post_params:
                category = post_params['category']
                result = dailyview_person_data.get_name_party_title_category_imageurl_rank(category)
            else:
                result = dailyview_person_data.get_name_party_title_category_imageurl_rank()

        else:
            result = {
                "message": "API path not found"
            }
        
        print(json.dumps(result, indent=4, ensure_ascii=False))
        
        return {
            "statusCode": 200,
            "headers": {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
                },
            "body": json.dumps(result, indent=4, ensure_ascii=False),
        }
    
    except Exception as e:
        print(e)

        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "message": "Internal Server Error",
                    "error": str(e)
                },
                indent=4,
                ensure_ascii=False
            ),
        }

if __name__ == "__main__":
    lambda_handler(None, None)