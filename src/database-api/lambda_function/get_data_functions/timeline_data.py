import get_data_functions.psycopg_methods as psycopg_methods

def get_timeline_data()->dict:

    sql = """
        SELECT t.time, t.source, t.title, t.url,  t.content, t.uid, json_agg(t.an_opinion) AS opinion_list FROM (
            SELECT n.time, n.source, n.title, n.url, n.content, n.uid, json_build_object('OPINION_SRC_found', o.opinion_srcs, 'OPINION_OPR_found', o.opinion_oprs, 'OPINION_SEG_found', o.opinion_segs, 'paragraph_index', o.paragraph_index, 'opinion_index_in_paragraph', o.opinion_index_in_paragraph) AS an_opinion
            FROM news_data_select AS n
            INNER JOIN opinion_extract_200_news AS o
            ON n.uid = o.news_uid
        ) AS t
        group by (t.time, t.source, t.title, t.url, t.content, t.uid)
        ORDER BY t.time DESC, t.title;
        """
    
    rows = psycopg_methods.execute_sql(sql)

    return rows