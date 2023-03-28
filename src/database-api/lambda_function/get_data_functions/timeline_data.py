import get_data_functions.psycopg_methods as psycopg_methods
import pathlib
import configparser 

def get_timeline_data(date=None)->dict:

    # sql = """
    #      SELECT t.time, t.source, t.title, t.url,  t.content, t.uid, json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph') AS opinion_list FROM (
    #         SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph) AS an_opinion
    #         FROM news_data_select AS n
    #         INNER JOIN opinion_extract_200_news AS o
    #         ON n.uid = o.news_uid
    #     ) AS t
    #     group by (t.time, t.source, t.title, t.url, t.content, t.uid)
    #     ORDER BY t.time DESC, t.title;
    #     """
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    SELECT_NEWS_DATA_TABLE_NAME = config['PostgreSQL']['SELECT_NEWS_DATA_TABLE_NAME']
    OPINION_TABLE_NAME = config['PostgreSQL']['OPINION_TABLE_NAME']
    
    if date == None:
        sql = f"""
            SELECT t.time, t.source, t.title, t.url,  t.content, t.uid, json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph') AS opinion_list FROM (
                SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph, 'opinion_src_resolution', o.opinion_src_resolution) AS an_opinion
                FROM {SELECT_NEWS_DATA_TABLE_NAME} AS n
                INNER JOIN {OPINION_TABLE_NAME} AS o
                ON n.uid = o.news_uid
            ) AS t
            group by (t.time, t.source, t.title, t.url, t.content, t.uid)
            ORDER BY t.time DESC, t.title;
            """
    else:
        sql = f"""
            SELECT t.time, t.source, t.title, t.url,  t.content, t.uid, json_agg(t.an_opinion ORDER BY t.an_opinion->>'paragraph_index', t.an_opinion->>'opinion_index_in_paragraph') AS opinion_list FROM (
                SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph, 'opinion_src_resolution', o.opinion_src_resolution) AS an_opinion
                FROM {SELECT_NEWS_DATA_TABLE_NAME} AS n
                INNER JOIN {OPINION_TABLE_NAME} AS o
                ON n.uid = o.news_uid
                WHERE (TO_TIMESTAMP('{date}', 'YYYY-MM-DD') - INTERVAL '7 day') < n.time and n.time <=(TO_TIMESTAMP('{date}', 'YYYY-MM-DD') + INTERVAL '1 day')
            ) AS t
            group by (t.time, t.source, t.title, t.url, t.content, t.uid)
            ORDER BY t.time DESC, t.title;
            """ 
    
    rows = psycopg_methods.execute_sql(sql)

    return rows