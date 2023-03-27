import get_data_functions.psycopg_methods as psycopg_methods

def get_name_party_title_category_imageurl_rank(category:str=None)->dict:

    if category is None:
        sql = """
            SELECT name, party, title, dailyview_category, dailyview_image_url, dailyview_rank FROM dailyview_person_data
            ORDER BY dailyview_rank ASC
            """
    else:
        sql = f"""
            SELECT name, party, title, dailyview_category, dailyview_image_url, dailyview_rank FROM dailyview_person_data
            WHERE dailyview_category = '{category}'
            ORDER BY dailyview_rank ASC
            """
    
    rows = psycopg_methods.execute_sql(sql)

    return rows