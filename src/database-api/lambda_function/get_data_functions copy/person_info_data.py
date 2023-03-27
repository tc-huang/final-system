import get_data_functions.psycopg_methods as psycopg_methods

def get_person_info(person_name:str)->dict:

    sql = f"""
        SELECT * FROM dailyview_person_data WHERE name = '{person_name}';
        """
    rows = psycopg_methods.execute_sql(sql)
    
    return rows[0]