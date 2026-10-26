"""
Lightweight sentiment analysis microservice.

GET /analyze/<text>  -> {"sentiment": "positive" | "neutral" | "negative"}

Uses TextBlob (no heavyweight model download needed) so it runs anywhere,
including small containers/offline CI runners.
"""
from flask import Flask, jsonify
from textblob import TextBlob
from urllib.parse import unquote

app = Flask(__name__)


def classify(text: str) -> str:
    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.1:
        return "positive"
    if polarity < -0.1:
        return "negative"
    return "neutral"


@app.route("/analyze/<path:text>", methods=["GET"])
def analyze(text):
    decoded = unquote(text)
    sentiment = classify(decoded)
    return jsonify({"sentiment": sentiment})


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Sentiment analyzer service is running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
