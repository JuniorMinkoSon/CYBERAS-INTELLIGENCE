"""
Service ML consultatif de CYBERAS (FastAPI).

Ce service est une couche SÉPARÉE et purement consultative : il n'appelle et
n'est appelé par aucun code Java directement, n'influence jamais le score
déterministe calculé par RiskEngine.java, et son indicible absence ne bloque
rien côté audit (voir AnswerConfidenceClient.java, qui retombe sur
Optional.empty() si ce service est indisponible).

Deux endpoints :
- POST /confidence/questionnaire-answer  (principal, soigné)
- POST /risk-cartography/classify        (secondaire, sommaire)
- GET  /health

Démarrage : si les modèles entraînés (ml-service/models/*.joblib) sont
absents, ils sont entraînés à la volée au premier démarrage (voir
`_ensure_models_trained`), pour que le service fonctionne "out of the box"
sans étape manuelle obligatoire.
"""
from __future__ import annotations

import os

import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

from ml_common import (
    CARTOGRAPHY_MODEL_PATH,
    CONFIDENCE_MODEL_PATH,
    RISK_LEVELS,
    build_cartography_features,
    build_confidence_features,
    generate_reason,
)

app = FastAPI(
    title="CYBERAS ML Service",
    description=(
        "Service ML consultatif (indice de confiance des réponses au "
        "questionnaire, cartographie des risques). N'influence jamais le "
        "score déterministe de RiskEngine."
    ),
    version="1.0.0",
)

_confidence_model = None
_cartography_model = None


def _ensure_models_trained() -> None:
    """Charge les modèles depuis ml-service/models/, ou les entraîne à la
    volée s'ils sont absents (premier démarrage sans étape manuelle)."""
    global _confidence_model, _cartography_model

    # Import différé : train.py importe aussi ml_common, autant ne payer le
    # coût de scikit-learn "training utils" que si on en a réellement besoin.
    import train

    if CONFIDENCE_MODEL_PATH.exists():
        _confidence_model = joblib.load(CONFIDENCE_MODEL_PATH)
    else:
        _confidence_model = train.train_confidence_model(save=True)

    if CARTOGRAPHY_MODEL_PATH.exists():
        _cartography_model = joblib.load(CARTOGRAPHY_MODEL_PATH)
    else:
        _cartography_model = train.train_cartography_model(save=True)


@app.on_event("startup")
def on_startup() -> None:
    _ensure_models_trained()


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /confidence/questionnaire-answer
# ---------------------------------------------------------------------------


class QuestionnaireAnswerRequest(BaseModel):
    domain: Optional[str] = None
    declaredLevel: Optional[int] = None
    avgEvidenceLevel: Optional[float] = None
    avgEvidenceConfidence: Optional[float] = None
    evidenceCount: int = 0


class ConfidenceVerdictResponse(BaseModel):
    confidenceIndex: float = Field(..., ge=0.0, le=1.0)
    flagged: bool
    reason: str
    model: str = "gini-tree-1.0"


@app.post(
    "/confidence/questionnaire-answer",
    response_model=ConfidenceVerdictResponse,
)
def confidence_questionnaire_answer(
    payload: QuestionnaireAnswerRequest,
) -> ConfidenceVerdictResponse:
    # Champ manquant : rien à évaluer, on répond "cohérent, non signalé" plutôt
    # que d'échouer. AnswerConfidenceClient.java attend une réponse 200 dans
    # tous les cas gérables (l'absence pure et simple de service est le seul
    # cas de repli côté Java, via Optional.empty()).
    if payload.declaredLevel is None:
        return ConfidenceVerdictResponse(
            confidenceIndex=1.0,
            flagged=False,
            reason=(
                "Niveau déclaré non renseigné : impossible d'évaluer la "
                "cohérence, aucun signalement."
            ),
            model="gini-tree-1.0",
        )

    features = build_confidence_features(
        declared_level=payload.declaredLevel,
        avg_evidence_level=payload.avgEvidenceLevel,
        avg_evidence_confidence=payload.avgEvidenceConfidence,
        evidence_count=payload.evidenceCount,
        domain=payload.domain,
    ).reshape(1, -1)

    proba = _confidence_model.predict_proba(features)[0]
    classes = list(_confidence_model.classes_)
    p_flagged = float(proba[classes.index(1)]) if 1 in classes else 0.0

    flagged = p_flagged >= 0.5
    confidence_index = round(1.0 - p_flagged, 2)

    reason = generate_reason(
        declared_level=payload.declaredLevel,
        avg_evidence_level=payload.avgEvidenceLevel,
        avg_evidence_confidence=payload.avgEvidenceConfidence,
        evidence_count=payload.evidenceCount,
        domain=payload.domain,
        flagged=flagged,
    )

    return ConfidenceVerdictResponse(
        confidenceIndex=confidence_index,
        flagged=flagged,
        reason=reason,
        model="gini-tree-1.0",
    )


# ---------------------------------------------------------------------------
# POST /risk-cartography/classify (secondaire)
# ---------------------------------------------------------------------------


class RiskCartographyRequest(BaseModel):
    category: str
    protocol: str
    occurrences: int
    riskLevel: str


class RiskCartographyResponse(BaseModel):
    suggestedRiskLevel: str
    neighbors: int
    model: str = "knn-1.0"


@app.post("/risk-cartography/classify", response_model=RiskCartographyResponse)
def risk_cartography_classify(
    payload: RiskCartographyRequest,
) -> RiskCartographyResponse:
    features = build_cartography_features(
        category=payload.category,
        protocol=payload.protocol,
        occurrences=payload.occurrences,
        risk_level=payload.riskLevel,
    ).reshape(1, -1)

    predicted_index = int(_cartography_model.predict(features)[0])
    suggested = RISK_LEVELS[predicted_index] if predicted_index < len(RISK_LEVELS) else payload.riskLevel

    return RiskCartographyResponse(
        suggestedRiskLevel=suggested,
        neighbors=_cartography_model.n_neighbors,
        model="knn-1.0",
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8600"))
    uvicorn.run(app, host="0.0.0.0", port=port)
