import get_data_functions.psycopg_methods as psycopg_methods

def get_time_source_title_url_news_uid()->dict:

    sql = """
        SELECT n.time, n.title, n.url, n.uid FROM news_data_select AS n
        INNER JOIN opinion_extract_200_news AS o ON n.uid = o.news_uid
        ORDER BY n.time DESC;
        """
    rows = psycopg_methods.execute_sql(sql)

    result = [
        {
            "time": str(row[0]),
            "title": row[1],
            "url": row[2],
            "uid": str(row[3])
        } for row in rows
    ]

    return result