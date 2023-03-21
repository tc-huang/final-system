FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./
RUN python3.9 -m pip install -r requirements.txt -t .
COPY app.py ./
COPY get_data_functions ./get_data_functions

# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambda_handler"]
