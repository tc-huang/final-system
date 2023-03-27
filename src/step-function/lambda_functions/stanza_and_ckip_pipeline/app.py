from datetime import datetime
import spacy
import stanza
import spacy_stanza
from ckip_transformers.nlp import CkipPosTagger, CkipNerChunker
from transformers import AutoModelForTokenClassification, BertTokenizerFast 
import os
from spacy_pipeline import pipeline_setup
import random
import uuid
import psycopg_methods
import pathlib
import configparser

if not os.path.exists('/tmp/model'):
    os.mkdir('/tmp/model')
if not os.path.exists('/tmp/model/bert-base-chinese'):
    os.mkdir('/tmp/model/bert-base-chinese')
if not os.path.exists('/tmp/model/bert-base-chinese-pos'):
    os.mkdir('/tmp/model/bert-base-chinese-pos')
if not os.path.exists('/tmp/model/bert-base-chinese-ner'):
    os.mkdir('/tmp/model/bert-base-chinese-ner')

# tokenizer = BertTokenizerFast.from_pretrained('bert-base-chinese', cache_dir='/tmp/model/bert-base-chinese')
# tokenizer.save_pretrained('/tmp/model/bert-base-chinese')
# del tokenizer

# model = AutoModelForTokenClassification.from_pretrained('ckiplab/bert-base-chinese-ner', cache_dir='/tmp/model/ckiplab/bert-base-chinese-ner')
# model.save_pretrained('/tmp/model/ckiplab/bert-base-chinese-ner')
# del model

# model = AutoModelForTokenClassification.from_pretrained('ckiplab/bert-base-chinese-pos', cache_dir='/tmp/model/ckiplab/bert-base-chinese-pos')
# model.save_pretrained('/tmp/model/ckiplab/bert-base-chinese-pos')
# del model

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
                opinion_group_show boolean,
                
                primary key (opinion_uid)
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
                if span.label_ == 'OPINION_SRC_match':
                    opinion_data['OPINION_SRCs'].append(span.text)
                elif span.label_ == 'OPINION_OPR_match':
                    opinion_data['OPINION_OPRs'].append(span.text)
                elif span.label_ == 'OPINION_SEG_match':
                    opinion_data['OPINION_SEGs'].append(span.text)
                
            create_opinion_extraction_result(opinion_data, OPINION_TABLE_NAME)




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

    news = event
    content = news['content']

    pipeline = pipeline_setup.get_aws_pipeline()
    
    docs = [doc for doc in pipeline.pipe(content)]

    

    transaction_result = {
        "stanza_and_ckip_pipeline_output": event,  # Timestamp of the when the transaction was completed
    }


    return transaction_result