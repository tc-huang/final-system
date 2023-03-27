import json
import get_data_functions.psycopg_methods as psycopg_methods
import get_data_functions.news_data_select as news_data_select
import get_data_functions.dailyview_person_data as dailyview_person_data
import get_data_functions.timeline_data as timeline_data
import get_data_functions.topic_cluster_data as topic_cluster_data
import get_data_functions.person_news_data as person_news_data
import get_data_functions.person_info_data as person_info_data

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
            if 'date' in post_params:
                date = post_params['date']
                result = timeline_data.get_timeline_data(date)
            else:
                result = timeline_data.get_timeline_data()
            # result = news_data_select.get_time_source_title_url_news_uid()
            
        
        elif api_path == "/person":
            if 'category' in post_params:
                category = post_params['category']
                result = dailyview_person_data.get_name_party_title_category_imageurl_rank(category)
            else:
                result = dailyview_person_data.get_name_party_title_category_imageurl_rank()

        elif api_path == "/person-news":
            if 'name' in post_params:
                name = post_params['name']
                result = person_news_data.get_timeline_data(name)
            else:
                result = {
                    "message": "SQL not found in POST parameter 'name'"
                }
        elif api_path == "/person-info":
            if 'name' in post_params:
                name = post_params['name']
                result = person_info_data.get_person_info(name)
            else:
                result = {
                    "message": "SQL not found in POST parameter 'name'"
                }
        
        elif api_path == "/cluster":
            if 'date' in post_params:
                date = post_params['date']
                result = topic_cluster_data.get_topic_cluster_data(date) 
            else:
                result = topic_cluster_data.get_topic_cluster_data()
        
        elif api_path == "/sql":
            if 'sql' in post_params:
                sql = post_params['sql']
                result = psycopg_methods.execute_sql(sql)
            else:
                result = {
                    "message": "SQL not found in POST parameter 'sql'"
                }
        else:
            result = {
                "message": "API path not found"
            }
        
        print(json.dumps(result, indent=4, ensure_ascii=False, default=str))
        
        return {
            "statusCode": 200,
            "headers": {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
                },
            "body": json.dumps(result, indent=4, ensure_ascii=False, default=str),
        }
    
    except Exception as e:
        print(e)

        return {
            "statusCode": 500,
            "headers": {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
                },
            "body": json.dumps(
                {
                    "message": "Internal Server Error",
                    "error": str(e),
                    "event":event,
                    "context":context

                },
                indent=4,
                ensure_ascii=False,
                default=str
            ),
        }

if __name__ == "__main__":
    lambda_handler(None, None)