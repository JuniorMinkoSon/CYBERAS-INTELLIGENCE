"""
Tests du endpoint principal /confidence/questionnaire-answer.

Lance l'entraînement (ou charge les modèles déjà entraînés dans
ml-service/models/) une seule fois via le TestClient FastAPI, qui déclenche
l'événement de démarrage (_ensure_models_trained).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_coherent_answer_not_flagged():
    """Déclaré=1, preuve moyenne ~1, 2 pièces jointes : cohérent, non signalé."""
    response = client.post(
        "/confidence/questionnaire-answer",
        json={
            "domain": "GOVERNANCE",
            "declaredLevel": 1,
            "avgEvidenceLevel": 1.0,
            "avgEvidenceConfidence": 0.9,
            "evidenceCount": 2,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is False
    assert body["confidenceIndex"] > 0.5
    assert body["model"] == "gini-tree-1.0"
    assert body["reason"]  # une phrase non vide, dérivée des valeurs reçues
    assert "1" in body["reason"]


def test_incoherent_answer_flagged():
    """Déclaré=4, preuve moyenne ~0, 2 pièces jointes : incohérent, signalé."""
    response = client.post(
        "/confidence/questionnaire-answer",
        json={
            "domain": "ACCESS",
            "declaredLevel": 4,
            "avgEvidenceLevel": 0.0,
            "avgEvidenceConfidence": 0.8,
            "evidenceCount": 2,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is True
    assert body["confidenceIndex"] < 0.5
    assert body["model"] == "gini-tree-1.0"
    assert "4" in body["reason"]


def test_no_evidence_low_declared_not_flagged():
    """Déclaré=0, aucune pièce jointe : cohérent (rien à étayer)."""
    response = client.post(
        "/confidence/questionnaire-answer",
        json={
            "domain": "DATA",
            "declaredLevel": 0,
            "avgEvidenceLevel": None,
            "avgEvidenceConfidence": None,
            "evidenceCount": 0,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is False


def test_high_declared_no_evidence_flagged():
    """Déclaré=4 sans aucune pièce jointe : affirmation forte non étayée, signalé."""
    response = client.post(
        "/confidence/questionnaire-answer",
        json={
            "domain": "NETWORK",
            "declaredLevel": 4,
            "avgEvidenceLevel": None,
            "avgEvidenceConfidence": None,
            "evidenceCount": 0,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is True


def test_missing_declared_level_defaults_to_not_flagged():
    """declaredLevel absent (null) : réponse défensive 200, non signalé."""
    response = client.post(
        "/confidence/questionnaire-answer",
        json={
            "domain": None,
            "declaredLevel": None,
            "avgEvidenceLevel": None,
            "avgEvidenceConfidence": None,
            "evidenceCount": 0,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is False
    assert body["confidenceIndex"] == 1.0


def test_risk_cartography_classify():
    response = client.post(
        "/risk-cartography/classify",
        json={
            "category": "DISPONIBILITE",
            "protocol": "UDP",
            "occurrences": 40,
            "riskLevel": "MEDIUM",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["suggestedRiskLevel"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert body["model"] == "knn-1.0"
    assert body["neighbors"] == 5
