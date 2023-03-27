from datetime import datetime
from datetime import timedelta
import psycopg_methods
import pathlib
import configparser
import json



def get_title_content_uid_tuple_a_date(from_date_include, to_date_exclude):
# date like '2023-01-01'

    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SELECT_NEWS_DATA_TABLE_NAME = config['PostgreSQL']['SELECT_NEWS_DATA_TABLE_NAME']
    
    sql = f"""
        SELECT time, title, content, uid FROM {SELECT_NEWS_DATA_TABLE_NAME}
        WHERE '{from_date_include}' <= time AND time < '{to_date_exclude}'
        order by random()
        limit 100;
        """
    
    rows = psycopg_methods.execute_sql(sql)
    
    return rows

def lambda_handler(event, context):
    """Sample Lambda function which mocks the operation of buying a random number
    of shares for a stock.

    For demonstration purposes, this Lambda function does not actually perform any 
    actual transactions. It simply returns a mocked result.

    Parameters
    ----------
    event: dict, required
        Input event to the Lambda function

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
        dict: Object containing details of the stock buying transaction
    """

    # process_date = event['process_date']

    # for opinion_id in opinion_id_list:
    #     response_json = connet_opinion_to_person(opinion_id)
    
    input_date_str = event
    input_date = datetime.strptime(input_date_str, '%Y-%m-%d')
    date_add = input_date + timedelta(days=1)
    date_add_str = str(date_add.date())

    news_uid_list = [str(i['uid']) for i in get_title_content_uid_tuple_a_date(input_date_str, date_add_str)]

    transaction_result = {
        "select_news_data_from_db": datetime.now().isoformat(),  # Timestamp of the when the transaction was completed
        "input_date": input_date_str,
        "date_add": date_add_str,
        "date": input_date_str,
        # "news_docs_bytes_list": json.loads(json.dumps(get_title_content_uid_tuple_a_date(input_date_str, date_add_str), ensure_ascii=False, default=str))
        "news_docs_bytes_list":news_uid_list
    }

    return transaction_result