FROM python:3.10.4-slim-buster
LABEL maintainer="LeeJuhwan"

ENV PYTHONUNBUFFERD=1

COPY ./requirments.txt /tmp/requirments.txt
COPY ./Opendata /Opendata
WORKDIR /Opendata
EXPOSE 8000

RUN python3 -m venv /py && \
    /py/bin/pip3 install --upgrade pip && \
    apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc && \
    /py/bin/pip3 install langchain&& \
    /py/bin/pip3 install scikit-learn&& \
    /py/bin/pip3 install -r /tmp/requirments.txt && \
    rm -rf /tmp
ENV PATH="/py/bin:$PATH"

