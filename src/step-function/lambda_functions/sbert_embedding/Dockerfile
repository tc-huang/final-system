FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./

RUN python3.9 -m pip install -r requirements.txt -t .

COPY sbert_model /tmp/sbert_model
COPY app.py config.cfg psycopg_methods.py ./

# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambda_handler"]