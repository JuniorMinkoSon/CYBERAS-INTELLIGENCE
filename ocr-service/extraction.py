"""Extraction du texte d'une pièce justificative (image ou PDF).

Deux chemins de lecture, choisis selon `contentType` :

- Image (png/jpeg/webp) : OCR direct via ``pytesseract``.
- PDF : on tente d'abord la couche texte native (PyMuPDF/``fitz``), qui ne
  coûte rien et ne dépend pas de la qualité d'un rendu image. Si elle est
  trop pauvre (moins de ``NATIVE_TEXT_MIN_CHARS`` caractères utiles), on
  suppose un PDF scanné et on rend les premières pages en image pour les
  passer à l'OCR — PyMuPDF sait le faire nativement (``page.get_pixmap``),
  sans dépendre de poppler.

Un fichier illisible (base64 corrompu en amont, PDF tronqué, image dont
l'en-tête est invalide) lève :class:`CorruptedContentError`, que l'appelant
traduit en réponse ``{"level": null, ...}`` avec un code 200 : un document
corrompu n'est pas un échec technique du service, c'est une pièce qui
n'établit rien.
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from typing import List, Optional

import fitz  # PyMuPDF
import pytesseract
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger("ocr-service.extraction")

# En dessous de ce nombre de caractères utiles (espaces retirés), la couche
# texte native d'un PDF est considérée comme absente ou négligeable : on
# bascule sur le rendu image + OCR, en supposant un document scanné.
NATIVE_TEXT_MIN_CHARS = 50

# Un PDF scanné de cent pages ne doit pas transformer un appel HTTP en
# traitement de plusieurs minutes. Au-delà, on n'OCRise que les premières
# pages : c'est une limite assumée de cette v1, documentée dans le README.
MAX_OCR_PAGES = 8

# Langues Tesseract utilisées : français d'abord (contenu attendu), anglais
# en repli pour les termes techniques ou documents mixtes. Nécessite que le
# paquet système `tesseract-ocr-fra` soit installé (voir Dockerfile).
TESSERACT_LANGS = "fra+eng"


class CorruptedContentError(Exception):
    """Le contenu fourni n'a pas pu être ouvert (corrompu, tronqué, invalide)."""


@dataclass
class ExtractionResult:
    text: str
    # "pdf_native" | "pdf_ocr" | "ocr_image"
    source: str
    # Confiance moyenne renvoyée par Tesseract (0-100), None si pas d'OCR
    # (texte natif) ou si aucun mot n'a été reconnu.
    mean_confidence: Optional[float]
    # Surface moyenne (largeur x hauteur, en pixels) des images analysées.
    # None pour le texte natif, où la notion de résolution ne s'applique pas.
    pixel_area: Optional[float]


def _ocr_image(image: Image.Image) -> tuple[str, List[float]]:
    """OCR d'une image déjà ouverte. Retourne le texte et les confiances par mot."""
    data = pytesseract.image_to_data(
        image, lang=TESSERACT_LANGS, output_type=pytesseract.Output.DICT
    )
    words: List[str] = []
    confidences: List[float] = []
    for raw_word, raw_conf in zip(data.get("text", []), data.get("conf", [])):
        word = (raw_word or "").strip()
        if not word:
            continue
        words.append(word)
        try:
            conf = float(raw_conf)
        except (TypeError, ValueError):
            conf = -1.0
        if conf >= 0:
            confidences.append(conf)
    return " ".join(words), confidences


def extract_image(raw: bytes) -> ExtractionResult:
    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise CorruptedContentError(f"image illisible : {exc}") from exc

    width, height = image.size
    text, confidences = _ocr_image(image)
    mean_confidence = sum(confidences) / len(confidences) if confidences else None
    return ExtractionResult(
        text=text,
        source="ocr_image",
        mean_confidence=mean_confidence,
        pixel_area=float(width * height),
    )


def extract_pdf(raw: bytes) -> ExtractionResult:
    try:
        document = fitz.open(stream=raw, filetype="pdf")
    except Exception as exc:  # PyMuPDF lève des types variés selon le dégât
        raise CorruptedContentError(f"pdf illisible : {exc}") from exc

    if document.page_count == 0:
        raise CorruptedContentError("pdf sans page")

    native_parts: List[str] = []
    for page in document:
        try:
            native_parts.append(page.get_text("text") or "")
        except Exception as exc:  # une page corrompue ne doit pas tout bloquer
            logger.debug("Page illisible dans le PDF, ignorée : %s", exc)

    native_text = "\n".join(native_parts)
    useful_chars = len("".join(native_text.split()))

    if useful_chars >= NATIVE_TEXT_MIN_CHARS:
        return ExtractionResult(
            text=native_text, source="pdf_native", mean_confidence=None, pixel_area=None
        )

    # Couche texte native absente ou trop pauvre : probable PDF scanné.
    ocr_parts: List[str] = []
    all_confidences: List[float] = []
    pixel_areas: List[float] = []

    pages_to_process = min(document.page_count, MAX_OCR_PAGES)
    for index in range(pages_to_process):
        page = document[index]
        try:
            # Zoom x2 : compromis lisibilité OCR / temps de rendu.
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            image = Image.open(io.BytesIO(pixmap.tobytes("png")))
            image.load()
        except Exception as exc:
            logger.debug("Rendu impossible pour la page %s : %s", index, exc)
            continue

        pixel_areas.append(float(image.size[0] * image.size[1]))
        text, confidences = _ocr_image(image)
        if text:
            ocr_parts.append(text)
        all_confidences.extend(confidences)

    text = "\n".join(ocr_parts)
    mean_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else None
    pixel_area = sum(pixel_areas) / len(pixel_areas) if pixel_areas else None

    return ExtractionResult(
        text=text, source="pdf_ocr", mean_confidence=mean_confidence, pixel_area=pixel_area
    )
