cp -r ../spacy_pipeline ./lambda_functions/stanza_and_ckip_pipeline

cp ./lambda_functions/config.cfg ./lambda_functions/stanza_and_ckip_pipeline
cp ./lambda_functions/config.cfg ./lambda_functions/sbert_embedding
cp ./lambda_functions/config.cfg ./lambda_functions/select_news_data_from_db
cp ./lambda_functions/config.cfg ./lambda_functions/topic_clustering
cp ./lambda_functions/config.cfg ./lambda_functions/opinion_extraction

cp ./lambda_functions/psycopg_methods.py ./lambda_functions/stanza_and_ckip_pipeline
cp ./lambda_functions/psycopg_methods.py ./lambda_functions/sbert_embedding
cp ./lambda_functions/psycopg_methods.py ./lambda_functions/select_news_data_from_db
cp ./lambda_functions/psycopg_methods.py ./lambda_functions/topic_clustering
cp ./lambda_functions/psycopg_methods.py ./lambda_functions/opinion_extraction
