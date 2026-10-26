"""
Helper functions that make Django act as a proxy in front of the
Node.js/Express + MongoDB dealership service and the Flask sentiment
analyzer microservice.
"""
import os
import requests
from django.conf import settings


def get_backend_url():
    return os.environ.get("BACKEND_URL", settings.BACKEND_URL)


def get_sentiment_url():
    return os.environ.get("SENTIMENT_ANALYZER_URL", settings.SENTIMENT_ANALYZER_URL)


def get_request(endpoint, **kwargs):
    params = "&".join(f"{k}={v}" for k, v in kwargs.items())
    url = f"{get_backend_url()}{endpoint}"
    if params:
        url += f"?{params}"
    try:
        response = requests.get(url, timeout=10)
        return response.json()
    except Exception as e:  # pragma: no cover - network errors
        print(f"Network exception calling {url}: {e}")
        return {"error": str(e)}


def analyze_review_sentiments(text):
    url = f"{get_sentiment_url()}/analyze/{requests.utils.quote(text)}"
    try:
        response = requests.get(url, timeout=10)
        return response.json()
    except Exception as e:  # pragma: no cover
        print(f"Network exception calling {url}: {e}")
        return {"sentiment": "neutral"}


def post_review(data_dict):
    url = f"{get_backend_url()}/insert_review"
    try:
        response = requests.post(url, json=data_dict, timeout=10)
        return response.json()
    except Exception as e:  # pragma: no cover
        print(f"Network exception calling {url}: {e}")
        return {"error": str(e)}
