import get_data_functions.psycopg_methods as psycopg_methods
import pathlib
import configparser 
def get_topic_cluster_data(date=None)->dict:
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SELECT_NEWS_DATA_TABLE_NAME = config['PostgreSQL']['SELECT_NEWS_DATA_TABLE_NAME']
    OPINION_TABLE_NAME = config['PostgreSQL']['OPINION_TABLE_NAME']
    CLUSTERING_TABLE_NAME = config['PostgreSQL']['CLUSTERING_TABLE_NAME'] 
    
    if date==None:
        sql = f"""
            SELECT c.cluster_id, json_agg(n.a_news_data) AS cluster_news_data_list
            FROM public.{CLUSTERING_TABLE_NAME} AS c
            INNER JOIN (
                SELECT t.uid, json_build_object('time', t.time, 'source', t.source, 'title', t.title, 'url', t.url,  'content', t.content,  'opinion_list', json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph')) AS a_news_data FROM (
                    SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph, 'opinion_src_resolution', o.opinion_src_resolution) AS an_opinion
                    FROM {SELECT_NEWS_DATA_TABLE_NAME} AS n
                    INNER JOIN {OPINION_TABLE_NAME} AS o
                    ON n.uid = o.news_uid
                ) AS t
                group by (t.time, t.source, t.title, t.url, t.content, t.uid)
                ORDER BY t.time DESC, t.title
            ) AS n
            ON n.uid::text = any(c.news_uid_in_cluster)
            GROUP BY c.cluster_id, c.news_uid_in_cluster
            ORDER BY array_length(c.news_uid_in_cluster, 1) DESC;
            """
        # sql = """
        #     SELECT c.cluster_id, json_agg(n.a_news_data) AS cluster_news_data_list
        #     FROM public.news_cluster_result_testing AS c
        #     INNER JOIN (
        #         SELECT t.uid, json_build_object('time', t.time, 'source', t.source, 'title', t.title, 'url', t.url,  'content', t.content,  'opinion_list', json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph')) AS a_news_data FROM (
        #             SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph) AS an_opinion
        #             FROM news_data_select AS n
        #             INNER JOIN opinion_extract_200_news AS o
        #             ON n.uid = o.news_uid
        #         ) AS t
        #         group by (t.time, t.source, t.title, t.url, t.content, t.uid)
        #         ORDER BY t.time DESC, t.title
        #     ) AS n
        #     ON n.uid::text = any(c.news_uid_in_cluster)
        #     GROUP BY c.cluster_id, c.news_uid_in_cluster
        #     ORDER BY array_length(c.news_uid_in_cluster, 1) DESC;
        #     """
    else:
        sql = f"""
            SELECT c.cluster_id, json_agg(n.a_news_data) AS cluster_news_data_list
            FROM public.{CLUSTERING_TABLE_NAME} AS c
            INNER JOIN (
                SELECT t.uid, json_build_object('time', t.time, 'source', t.source, 'title', t.title, 'url', t.url,  'content', t.content,  'opinion_list', json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph')) AS a_news_data FROM (
                    SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph, 'opinion_src_resolution', o.opinion_src_resolution) AS an_opinion
                    FROM {SELECT_NEWS_DATA_TABLE_NAME} AS n
                    INNER JOIN {OPINION_TABLE_NAME} AS o
                    ON n.uid = o.news_uid
                ) AS t
                group by (t.time, t.source, t.title, t.url, t.content, t.uid)
                ORDER BY t.time DESC, t.title
            ) AS n
            ON n.uid::text = any(c.news_uid_in_cluster)
            WHERE c.cluster_time='{date}'
            GROUP BY c.cluster_id, c.news_uid_in_cluster
            ORDER BY array_length(c.news_uid_in_cluster, 1) DESC;
            """
    
    rows = psycopg_methods.execute_sql(sql)

    return rows