# Service OCR + cohérence lexicale (voir README.md et
# PythonOcrEvidenceAnalyzer.java côté backend pour le contrat appelant).
FROM python:3.11-slim

# tesseract-ocr : moteur OCR utilisé par pytesseract.
# tesseract-ocr-fra : jeu de données français (les pièces attendues sont
# très majoritairement en français ; l'anglais reste dans TESSERACT_LANGS
# en repli pour les termes techniques).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-fra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py extraction.py scoring.py ./

ENV PORT=8500
EXPOSE 8500

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import os,urllib.request; urllib.request.urlopen('http://localhost:' + os.environ.get('PORT','8500') + '/health', timeout=3)" || exit 1

# Forme shell : nécessaire pour que ${PORT:-8500} soit interprété par le
# shell du conteneur (docker-compose fixe PORT=8500, ce défaut ne joue que
# hors compose).
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8500}
