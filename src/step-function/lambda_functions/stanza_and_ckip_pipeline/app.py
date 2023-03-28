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


def get_name_list(docs, paragraph_index):
    ent_list_list = []
    for doc in docs:
        ent_list = [ent for ent in doc.ents if ent.label_ == "PERSON"]
        ent_list.reverse()
        ent_list_list.append(ent_list)
    same_paragraph = ent_list_list[paragraph_index] 
    ent_list_list = ent_list_list[:paragraph_index] 
    ent_list_list.reverse()
    return same_paragraph, [i for j in ent_list_list for i in j]

def check_SRC_type(span):
    if len(span) == 1:
        token = span[0]
        if len(token) == 1:
            if token.pos_ == "PRON":
                return (token.pos_, token.text) # 他
            elif token.pos_ == "PROPN":
                return (token.pos_, token.text)# 張
        # else:
        #     if token.pos_ == "NOUN":
        #         return True # 官員 總統
    
    elif len(span) == 2:
        token1, token2 = span[0], span[1]
        if len(token1) == 1 and len(token2) == 2:
            if token1.pos_ == "PROPN" and token2.pos_ == "NOUN":
                return (token1.pos_, token1.text) # 蔡總統 盧市長
        
        # if token1.pos_ == "NOUN" and token2.pos_ == "NOUN":
        #     return True # 媽媽市長 縣黨部
    
    elif len(span) == 3:
        token1, token2, token3 = span[0], span[1], span[2]
        if len(token1) == 1 and len(token2) == 1 and len(token3) == 2:
            if token1.pos_ == "PROPN" and token2.pos_ == "PART" and token3.pos_ == "NOUN":
                return (token1.pos_, token1.text) # 賴副總統
    
    # if len(span) >= 2:
    #     if span[0].pos_ == "DET" and all(["NOUN" in token.pos_ for token in span[1:]]):
    #         return "DET" # 該綠營人士 這名黨政人士 該人士 該立委
        
    
        
        # elif span[0].pos_ == "NUM" and all(["NOUN" in token.pos_ for token in span[1:]]):
        #     return True # 3位監委 2位監委
    return None

def find_pronoun_resolution(docs, pragraph_index, span):
    try:
        span_type= check_SRC_type(span)
        print("span_type", span_type)
        if span_type != None:
            if span_type[0] == "PRON":
                names_same_paragraph, names_before = get_name_list(docs, pragraph_index)
                print("PRON", names_same_paragraph, names_before)
                if len(names_same_paragraph) != 0:
                    for name in names_same_paragraph:
                        if name.start < span.start:
                            return name
                if len(names_before) > 0:
                    return names_before[0]
                return None
            
            if span_type[0] == "PROPN":
                names_same_paragraph, names_before = get_name_list(docs, pragraph_index)
                print("PRON", names_same_paragraph, names_before)
                if len(names_same_paragraph) != 0:
                    for name in names_same_paragraph:
                        if name.start < span.start and span_type[1] in name.text:
                            return name
                if len(names_before) > 0:
                    for name in names_before:
                        if name.start < span.start and span_type[1] in name.text:
                            return name
                return None
            return None
        return None
    except:
        return None
    return None


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
                    name = find_pronoun_resolution(docs, doc._.paragraph_index, span)
                    if name != None:
                        print(f"{name} found !!!!!!!!!!!!!!!!!")
                        opinion_data['OPINION_SRC_resolution'] = [name.text]
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