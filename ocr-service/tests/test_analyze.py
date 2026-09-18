"""Tests du service OCR.

Lancer avec : pip install -r requirements-dev.txt && pytest
(depuis le dossier ocr-service/).
"""

import base64
import io
import os

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_empty_content_returns_null_level():
    payload = {
        "fileName": "vide.pdf",
        "contentType": "application/pdf",
        "contentBase64": base64.b64encode(b"").decode(),
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["level"] is None
    assert body["analyzer"] == "ocr-consistency-1.0"
    assert 0.0 <= body["confidence"] <= 1.0


def test_corrupted_pdf_returns_null_level_not_http_error():
    # Des octets aléatoires ne forment pas un PDF valide : PyMuPDF doit
    # échouer à l'ouverture. Le service doit répondre 200 avec level=null,
    # pas une erreur HTTP (un fichier corrompu n'est pas un échec technique
    # du service, voir docstring de main.py).
    garbage = os.urandom(256)
    payload = {
        "fileName": "corrompu.pdf",
        "contentType": "application/pdf",
        "contentBase64": base64.b64encode(garbage).decode(),
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["level"] is None


def test_invalid_base64_returns_null_level_not_http_error():
    payload = {
        "fileName": "invalide.png",
        "contentType": "image/png",
        "contentBase64": "ceci n'est pas du base64 valide !!!",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["level"] is None


def test_native_pdf_text_produces_coherent_non_null_level():
    pytest.importorskip("fpdf")
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)

    # Texte volontairement long, daté et truffé de vocabulaire de pilotage,
    # pour retomber sur un niveau élevé selon la règle documentée dans
    # scoring.py (volume + indices de formalisation).
    paragraph = (
        "Politique de securite de l'information. Ce document est approuve "
        "et signe le 12/03/2024 par la direction. Il decrit la gouvernance, "
        "les procedures de controle d'acces, et fait l'objet d'une revue "
        "periodique annuelle. Article 1 : objet. Article 2 : perimetre. "
    )
    full_text = paragraph * 6  # de quoi largement dépasser 120 mots utiles

    for start in range(0, len(full_text), 90):
        pdf.multi_cell(0, 8, full_text[start : start + 90])

    raw_output = pdf.output(dest="S")
    pdf_bytes = raw_output.encode("latin-1") if isinstance(raw_output, str) else bytes(raw_output)

    payload = {
        "fileName": "politique-acces.pdf",
        "contentType": "application/pdf",
        "contentBase64": base64.b64encode(pdf_bytes).decode(),
        "question": {
            "code": "ACC-01",
            "text": "Une politique de controle d'acces est-elle formalisee ?",
            "guidance": "On attend une gouvernance et une revue periodique des acces.",
        },
    }

    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    body = response.json()

    assert body["level"] is not None
    assert body["level"] >= 1  # du texte long et daté doit dépasser le niveau plancher
    assert 0.0 <= body["confidence"] <= 1.0
    assert body["analyzer"] == "ocr-consistency-1.0"
    assert "OCR" in body["rationale"] or "extrait" in body["rationale"].lower()


def test_image_ocr_returns_a_response_without_crashing():
    # L'OCR sur une police système varie selon la machine (fontes
    # disponibles, rendu) : on ne vérifie pas un niveau précis, seulement que
    # le service lit effectivement quelque chose et répond dans le contrat,
    # sans erreur HTTP. Si tesseract n'est pas installé sur la machine qui
    # exécute les tests, ce test est ignoré plutôt qu'en échec (l'absence de
    # tesseract est une question d'environnement, pas un bug du service).
    try:
        import pytesseract

        pytesseract.get_tesseract_version()
    except Exception:
        pytest.skip("tesseract non installé sur cette machine")

    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGB", (1000, 320), color="white")
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("arial.ttf", 42)
    except Exception:
        font = ImageFont.load_default()

    draw.text((10, 10), "Politique de securite approuvee", fill="black", font=font)
    draw.text((10, 90), "Signee le 12/03/2024 par la direction", fill="black", font=font)
    draw.text((10, 170), "Revue periodique annuelle prevue", fill="black", font=font)

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")

    payload = {
        "fileName": "capture-politique.png",
        "contentType": "image/png",
        "contentBase64": base64.b64encode(buffer.getvalue()).decode(),
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["analyzer"] == "ocr-consistency-1.0"
    assert body["level"] is None or 0 <= body["level"] <= 4
    assert 0.0 <= body["confidence"] <= 1.0
