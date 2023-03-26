FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./

RUN python3.9 -m pip install --upgrade pip
# RUN python3.9 -m pip install -r requirements.txt -t .
RUN python3.9 -m pip install -r requirements.txt --no-cache-dir -t .

COPY spacy_pipeline ./spacy_pipeline
ENV TRANSFORMERS_CACHE="/tmp/model"

COPY app.py config.cfg psycopg_methods.py ./
RUN python3.9 -m pip install "psycopg[binary]"==3.1.8


# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambda_handler"]