from datetime import datetime
from spacy_pipeline import pipeline_setup
import random
import uuid
import psycopg_methods
import pathlib
import configparser
import json
# import os
def get_title_content_uid(news_uid):
# date like '2023-01-01'

    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SELECT_NEWS_DATA_TABLE_NAME = config['PostgreSQL']['SELECT_NEWS_DATA_TABLE_NAME']
    
    sql = f"""
        SELECT time, title, content, uid FROM {SELECT_NEWS_DATA_TABLE_NAME}
        WHERE uid='{news_uid}'
        LIMIT 1;
        """
    
    rows = psycopg_methods.execute_sql(sql)
    
    return rows

def create_opinion_extraction_result(opinion_data:dict, table_name:str)->None:
        
        table_columns = "opinion_uid, news_uid, paragraph_index, opinion_index_in_paragraph, OPINION_SRCs, OPINION_OPRs, OPINION_SEGs, OPINION_SRC_resolution, OPINION_SRC_name_found, opinion_group_id, opinion_group_show"
        table_columns_format = "%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s"

        # opinion_data['opinion_group_show'] = False
        opinion_data_list = [
            opinion_data['opinion_uid'],
            opinion_data['news_uid'],
            opinion_data['paragraph_index'],
            opinion_data['opinion_index_in_paragraph'],
            opinion_data['OPINION_SRCs'],
            opinion_data['OPINION_OPRs'],
            opinion_data['OPINION_SEGs'],
            opinion_data['OPINION_SRC_resolution'],
            opinion_data['OPINION_SRC_name_found'],
            opinion_data['opinion_group_id'],
            opinion_data['opinion_group_show']
        ]
        print(opinion_data_list)

        sql = f"""
            CREATE TABLE if NOT EXISTS {table_name} (
                opinion_uid uuid,
                news_uid uuid,
                paragraph_index int,
                opinion_index_in_paragraph int,
                OPINION_SRCs text[],
                OPINION_OPRs text[],
                OPINION_SEGs text[],
                OPINION_SRC_resolution text[],
                OPINION_SRC_name_found text[],
                opinion_group_id text,
                opinion_group_show boolean
            );

            SET TIME ZONE 'Asia/Taipei';
            """
        
        psycopg_methods.execute_sql(sql, not_fetch=True)

        sql = f"""
            INSERT INTO {table_name} ({table_columns}) VALUES ({table_columns_format});
            """

        psycopg_methods.execute_sql(sql, opinion_data_list, not_fetch=True)

def opinion_in_docs_to_db(docs):
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)

    opinion_data_list = []
    
    OPINION_TABLE_NAME = config['PostgreSQL']['OPINION_TABLE_NAME']
    for doc in docs:
        opinion_index = 0
        while f"opinion_found[{opinion_index}]" in doc.spans:
            opinion_data = {
                    'opinion_uid': str(uuid.uuid1()),
                    'news_uid': doc._.news_uid,
                    'paragraph_index': doc._.paragraph_index,
                    'opinion_index_in_paragraph': opinion_index,
                    'OPINION_SRCs': [],
                    'OPINION_OPRs': [],
                    'OPINION_SEGs': [],
                    'OPINION_SRC_resolution': None,
                    'OPINION_SRC_name_found': None,
                    'opinion_group_id': str(random.randint(1,10)),
                    'opinion_group_show': True,
                } 
            for span in doc.spans[f"opinion_found[{opinion_index}]"]:
                if span.label_ == 'OPINION_SRC_found':
                    opinion_data['OPINION_SRCs'].append(span.text)
                elif span.label_ == 'OPINION_OPR_found':
                    opinion_data['OPINION_OPRs'].append(span.text)
                elif span.label_ == 'OPINION_SEG_found':
                    opinion_data['OPINION_SEGs'].append(span.text)
                # print(span, span.label_)
                
            create_opinion_extraction_result(opinion_data, OPINION_TABLE_NAME)
            opinion_index += 1
            opinion_data_list.append(opinion_data)

    return opinion_data_list


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
    # print('pwd: ', os.getcwd())
    # print('listdir .', os.listdir('.'))
    # print('listdir /tmp', os.listdir('/tmp'))
    # print('listdir /tmp/bert_model', os.listdir('/tmp/bert_model'))
    # print('listdir /tmp/bert_model/bert-base-chinese-pos', os.listdir('/tmp/bert_model/bert-base-chinese-pos'))
    # print('listdir /tmp/bert_model/bert-base-chinese-ner', os.listdir('/tmp/bert_model/bert-base-chinese-ner'))
    news_uid = event
    news = get_title_content_uid(news_uid)[0]
    content = news['content']
    news_uid = news['uid']
    time = news['time']
    title = news['title']
    print(news)


    pipeline = pipeline_setup.get_aws_pipeline()
    
    docs = []

    for index, doc in enumerate(pipeline.pipe(content)):
        doc._.news_uid = news_uid
        doc._.news_title = title
        doc._.paragraph_index = index
        docs.append(doc)

    opinion_data_list = opinion_in_docs_to_db(docs)

    transaction_result = {
        "stanza_and_ckip_pipeline_output": json.dumps(opinion_data_list, default=str, ensure_ascii=False)  # Timestamp of the when the transaction was completed

    }

    return transaction_result