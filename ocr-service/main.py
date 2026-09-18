"""Service OCR + cohérence lexicale pour les pièces justificatives CYBERAS.

Appelé par `PythonOcrEvidenceAnalyzer.java` côté backend. Contrat HTTP figé
côté Java, à ne pas modifier ici sans modifier ce fichier de l'autre côté :

    POST /analyze
    {"fileName": "...", "contentType": "...", "contentBase64": "...",
     "question": {"code": "...", "text": "...", "guidance": "..."}}   # question optionnelle
    ->
    {"level": 0..4 | null, "confidence": 0.0..1.0, "rationale": "...",
     "analyzer": "ocr-consistency-1.0"}

    GET /health -> {"status": "ok"}

Principe à respecter dans toute évolution de ce service : la réponse ne dit
JAMAIS qu'un document est authentique. Elle dit jusqu'à quel niveau de
maturité la pièce, telle qu'elle a pu être lue, permet d'étayer une réponse.

Codes HTTP : seul 200 est traité comme une réponse exploitable côté Java —
tout autre code fait basculer sur l'analyseur heuristique de repli. Un
contenu illisible (fichier vide, corrompu, page blanche) reste donc un 200
avec `level: null` : ce n'est pas un échec du service, c'est un verdict
("rien d'exploitable"). Seul un vrai problème technique (tesseract absent,
bug interne) doit produire un code d'erreur.
"""

from __future__ import annotations

import base64
import binascii
import logging
import re
from typing import Optional

import pytesseract
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from extraction import CorruptedContentError, extract_image, extract_pdf
from scoring import build_rationale, compute_confidence, compute_level, lexical_similarity, structuration_indicators

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ocr-service")

ANALYZER_NAME = "ocr-consistency-1.0"

# En dessous de ce nombre de caractères utiles (espaces retirés), le texte
# extrait est jugé inexploitable : fichier vide, page blanche, OCR
# infructueux. On rend `level: null` plutôt que de forcer un score sur
# quasiment rien.
USEFUL_TEXT_MIN_CHARS = 20

SUPPORTED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}

app = FastAPI(
    title="ocr-service",
    description=(
        "OCR et cohérence lexicale des pièces justificatives CYBERAS. "
        "Ne juge jamais l'authenticité d'un document."
    ),
    version="1.0.0",
)


class QuestionPayload(BaseModel):
    code: Optional[str] = None
    text: Optional[str] = ""
    guidance: Optional[str] = ""


class AnalyzeRequest(BaseModel):
    fileName: str
    contentType: str
    contentBase64: str
    question: Optional[QuestionPayload] = None


class AnalyzeResponse(BaseModel):
    level: Optional[int] = Field(default=None, ge=0, le=4)
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    analyzer: str = ANALYZER_NAME


def _unusable(message: str, confidence: float = 0.1) -> AnalyzeResponse:
    return AnalyzeResponse(level=None, confidence=confidence, rationale=message, analyzer=ANALYZER_NAME)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        raw = base64.b64decode(payload.contentBase64, validate=False)
    except (binascii.Error, ValueError):
        return _unusable("Le contenu fourni n'a pas pu être décodé (base64 invalide).")

    if not raw:
        return _unusable("Fichier vide : rien à analyser.", confidence=0.05)

    try:
        if payload.contentType == "application/pdf":
            result = extract_pdf(raw)
        elif payload.contentType in SUPPORTED_IMAGE_TYPES:
            result = extract_image(raw)
        else:
            # Le Java filtre les types en amont ; on reste défensif si un
            # type imprévu arrive malgré tout.
            return _unusable(
                f"Type de contenu non pris en charge par ce service ({payload.contentType}).",
                confidence=0.0,
            )
    except CorruptedContentError as exc:
        logger.info("Contenu illisible pour %s : %s", payload.fileName, exc)
        return _unusable(
            "Le fichier n'a pas pu être ouvert (corrompu ou format invalide).", confidence=0.05
        )
    except pytesseract.TesseractNotFoundError as exc:
        # Un vrai problème d'installation, pas un verdict sur la pièce :
        # le Java doit basculer sur l'heuristique plutôt que recevoir un
        # niveau fondé sur rien.
        logger.error("Tesseract introuvable : %s", exc)
        raise HTTPException(
            status_code=500, detail="Le moteur OCR (tesseract) n'est pas installé sur ce service."
        ) from exc
    except Exception as exc:  # échec technique réel, imprévu
        logger.exception("Échec technique inattendu pendant l'analyse de %s", payload.fileName)
        raise HTTPException(status_code=500, detail="Échec technique de l'analyse.") from exc

    useful_text = re.sub(r"\s+", " ", result.text or "").strip()
    if len(useful_text) < USEFUL_TEXT_MIN_CHARS:
        return _unusable(
            "Aucun contenu exploitable n'a pu être extrait (fichier vide, page blanche, ou OCR "
            "infructueux).",
            confidence=0.1,
        )

    word_count = len(useful_text.split())
    structuration_count, structuration_labels = structuration_indicators(useful_text)

    similarity: Optional[float] = None
    question_code: Optional[str] = None
    if payload.question is not None:
        question_code = payload.question.code
        query = f"{payload.question.text or ''} {payload.question.guidance or ''}".strip()
        similarity = lexical_similarity(useful_text, query)

    level = compute_level(word_count, structuration_count, similarity)
    confidence = compute_confidence(result.source, word_count, result.mean_confidence, result.pixel_area)
    rationale = build_rationale(result.source, word_count, structuration_labels, similarity, question_code)

    return AnalyzeResponse(level=level, confidence=confidence, rationale=rationale, analyzer=ANALYZER_NAME)


if __name__ == "__main__":
    import os

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8500")))
