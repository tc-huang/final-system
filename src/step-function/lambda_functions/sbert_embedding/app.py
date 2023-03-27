from datetime import datetime
from sentence_transformers import SentenceTransformer
import psycopg_methods
import pickle
import pathlib
import configparser

def create_validate_content(content):
    import re
    result_content = []
    for paragraph in content:
        paragraph = re.sub(r'〔.*?〕', '', paragraph)
        paragraph = paragraph.replace('\n', '').replace(' ', '')

        if len(paragraph) > 0:
            result_content.append(paragraph)
    
    return result_content

def create_sbert_input(title, content):
    sbert_input = title + ''.join(content[:2])
    sbert_input.replace('\n', ' ').replace(' ','').replace(' ','')
    return sbert_input

def create_sbert_embedding(sbert_input):
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2', cache_folder = '/tmp')
    # model = SentenceTransformer('/tmp/sbert_model', cache_folder = '/tmp/sbert_model') 
    emb = model.encode(sbert_input, convert_to_tensor=True)
    return emb

def news_uid_sbert_embedding_to_db(time, news_uid, sbert_embedding):
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SBERT_EMBEDDING_TABLE_NAME = config['PostgreSQL']['SBERT_EMBEDDING_TABLE_NAME']
    sql = f"""
        CREATE TABLE if NOT EXISTS {SBERT_EMBEDDING_TABLE_NAME} (
            time timestamp,
            news_uid uuid,
            sbert_embedding bytea
        );
        """
 
    psycopg_methods.execute_sql(sql, not_fetch=True)

    tensor_bytes = pickle.dumps(sbert_embedding)

    sql = f"""
        INSERT INTO {SBERT_EMBEDDING_TABLE_NAME} (time, news_uid, sbert_embedding) VALUES (%s, %s, %s);
        """
    
    psycopg_methods.execute_sql(sql, (time, news_uid, tensor_bytes), not_fetch=True)

def one_news_to_vector(time, title, content, uid):
    content = create_validate_content(content)
    sbert_input = create_sbert_input(title, content)
    sbert_embedding = create_sbert_embedding(sbert_input)
    news_uid_sbert_embedding_to_db(time, uid, sbert_embedding)
    print(f"{title} done!")

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

    all_news = event

    time = None

    for news in all_news:

        time = datetime.strptime(news['time'], '%Y-%m-%d %H:%M:%S')
        one_news_to_vector(time, news['title'], news['content'], news['uid'])

    date = time.strftime('%Y-%m-%d')

    transaction_result = {
        "sbert_embedding": datetime.now().isoformat(),  # Timestamp of the when the transaction was completed
        "date": date
    }

    return transaction_result