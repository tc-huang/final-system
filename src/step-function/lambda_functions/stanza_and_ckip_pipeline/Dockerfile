FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./
RUN python3.9 -m pip install --upgrade pip
# RUN python3.9 -m pip install -r requirements.txt -t .
RUN python3.9 -m pip install -r requirements.txt -t .
ENV TRANSFORMERS_CACHE="/tmp/bert_model"
COPY download_models/bert_model /tmp/bert_model
COPY download_models/stanza_resources /tmp/stanza_resources 


COPY spacy_pipeline ./spacy_pipeline
COPY app.py config.cfg psycopg_methods.py ./



# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambda_handler"]