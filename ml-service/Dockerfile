FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml_common.py train.py main.py ./

# Entraîne les modèles au build : le service démarre "chaud", sans latence
# de premier appel. Si les modèles sont malgré tout absents au démarrage
# (volume monté vide, image reconstruite partiellement, etc.), main.py les
# entraîne lui-même à la volée (voir _ensure_models_trained) : ce n'est
# jamais une étape manuelle obligatoire.
RUN python train.py

ENV PORT=8600
EXPOSE 8600

CMD ["python", "main.py"]
