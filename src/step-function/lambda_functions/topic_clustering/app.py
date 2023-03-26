from datetime import datetime
from psycopg_methods import exec_sql
import pathlib
import configparser
from sklearn.cluster import AgglomerativeClustering
import pickle


def get_newsuid_vector_tuple_a_date(from_date_include, to_date_include):
# date like '2023-01-01'
    # sql = f"""
    #     SELECT time, title, content, uid FROM news_data_select
    #     WHERE '{from_date_include}' <= time AND time < '{to_date_exclude}';
    #     """
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SBERT_EMBEDDING_TABLE_NAME = config['PostgreSQL']['SBERT_EMBEDDING_TABLE_NAME'] 
    sql = f"""
        SELECT news_uid, sbert_embedding FROM {SBERT_EMBEDDING_TABLE_NAME}
        WHERE '{from_date_include}' <= time AND time <= '{to_date_include}';
        """
    result = exec_sql(sql)

    news_uid_list = [i[0] for i in result]
    sbert_embedding_list = [pickle.loads(i[1]) for i in result]
    return news_uid_list, sbert_embedding_list

def cluster_result_to_db(news_uid_list, cluster_assignment, cluster_time:datetime):
    assert len(news_uid_list) == len(cluster_assignment)
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    CLUSTERING_TABLE_NAME = config['PostgreSQL']['CLUSTERING_TABLE_NAME']
    sql = f"""
        CREATE TABLE if NOT EXISTS {CLUSTERING_TABLE_NAME} (
            cluster_time timestamp,
            cluster_id text,
            news_uid_in_cluster text[]
        );
        SET TIME ZONE 'Asia/Taipei';
        """
    
    exec_sql(sql)
    
    cluster_result = {}
    for news_uid, cluster_id in zip(news_uid_list, cluster_assignment):
        cluster_id = str(cluster_id)
        if cluster_id not in cluster_result:
            
            cluster_result[cluster_id] = []
        cluster_result[cluster_id].append(news_uid)

    for cluster_id in cluster_result.keys():

        sql = f"""
            INSERT INTO {CLUSTERING_TABLE_NAME} (cluster_time, cluster_id, news_uid_in_cluster) VALUES (%s, %s, %s);
            """

        exec_sql(sql, (cluster_time, cluster_id, cluster_result[cluster_id]))


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

    date = event
    to_date_include = datetime.datetime.strptime(date, '%Y-%m-%d')
    from_date_include = to_date_include - datetime.timedelta(days=7)
    from_date_include_str = str(from_date_include.date())
    to_date_include_str = str(to_date_include.date())

    news_uid_list, sbert_embedding_list = get_newsuid_vector_tuple_a_date(from_date_include_str, to_date_include_str)
    clustering = AgglomerativeClustering(n_clusters=10).fit(sbert_embedding_list)
    cluster_assignment = clustering.labels_
    cluster_result_to_db(news_uid_list, cluster_assignment, to_date_include) 

    transaction_result = {
        "topic_clustering": datetime.now().isoformat(),  # Timestamp of the when the transaction was completed
    }


    return transaction_result