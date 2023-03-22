import configparser
import psycopg
from psycopg.rows import dict_row
import pathlib


def get_conninfo()->str:
    config_path = pathlib.Path(__file__).parent.absolute() / 'config.cfg'
    config = configparser.ConfigParser()
    config.read(config_path)
    
    DB_INSTANCE_ENDPOINT = config['PostgreSQL']['DB_INSTANCE_ENDPOINT']
    DB_NAME = config['PostgreSQL']['DB_NAME']
    PORT = config['PostgreSQL']['PORT']
    MASTER_USER_NAME = config['PostgreSQL']['MASTER_USER_NAME']
    PASSWORD = config['PostgreSQL']['PASSWORD']

    conninfo = f"host={DB_INSTANCE_ENDPOINT} dbname={DB_NAME} port={PORT} user={MASTER_USER_NAME} password={PASSWORD}"
    return conninfo

def execute_sql(sql:str, data_tuple:tuple=None)->list[tuple]:
    # try:
    conninfo = get_conninfo()
    
    with psycopg.connect(conninfo) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(sql, data_tuple)
            conn.commit()
            rows = cur.fetchall()
            return rows
    
    # except:
    #     return None