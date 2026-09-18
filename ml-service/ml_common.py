"""
Fonctions partagées entre train.py (entraînement) et main.py (service HTTP) :
- lecture (best-effort) de la base de connaissance des référentiels,
- construction des features à partir des champs du contrat HTTP,
- génération du jeu de données synthétique v1 (bootstrap),
- génération des phrases `reason` lisibles par un auditeur,
- utilitaires pour l'endpoint secondaire de cartographie des risques.

Rien ici n'appelle RiskEngine ni aucun code Java : ce service est autonome et
purement consultatif (voir README.md).
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

import numpy as np

# ---------------------------------------------------------------------------
# Chemins
# ---------------------------------------------------------------------------

SERVICE_DIR = Path(__file__).resolve().parent
MODEL_DIR = SERVICE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

CONFIDENCE_MODEL_PATH = MODEL_DIR / "confidence_model.joblib"
CARTOGRAPHY_MODEL_PATH = MODEL_DIR / "cartography_model.joblib"

# Emplacement attendu de l'export JSON de la base de connaissance, tel que
# décrit dans la consigne : "../data/knowledge-base/referentiels.json" par
# rapport à ml-service/. Ce fichier vit à la racine du dépôt Java et n'est
# PAS forcément présent dans l'image Docker du service (le contexte de build
# ne couvre que ml-service/) : la lecture est donc toujours "best effort",
# avec un repli figé ci-dessous qui reproduit les mêmes valeurs pour que le
# comportement du modèle ne dépende jamais de la présence de ce fichier.
KNOWLEDGE_BASE_PATH = Path(
    os.environ.get(
        "KNOWLEDGE_BASE_PATH",
        str(SERVICE_DIR.parent / "data" / "knowledge-base" / "referentiels.json"),
    )
)

# Repli si referentiels.json est introuvable (ex. build Docker isolé) :
# nombre de catégories MEHARI (DISPONIBILITE, INTEGRITE, CONFIDENTIALITE,
# TRACABILITE) qui référencent chaque domaine du questionnaire, recopié à la
# main depuis referentiels.json au moment de l'écriture de ce service.
# Un domaine référencé par plusieurs catégories MEHARI est traité comme plus
# "sensible" : le seuil de tolérance sur l'écart déclaré/preuve y est
# légèrement réduit (cf. build_confidence_features / generate_confidence_dataset).
_FALLBACK_DOMAIN_SENSITIVITY = {
    "GOVERNANCE": 1,
    "RISK": 0,
    "ASSETS": 0,
    "ACCESS": 2,
    "NETWORK": 2,
    "APPLICATIONS": 1,
    "VULNERABILITIES": 1,
    "DATA": 2,
    "DETECTION": 1,
    "INCIDENTS": 1,
    "CONTINUITY": 1,
    "SUPPLIERS": 0,
    "COMPLIANCE": 0,
    "HUMAN": 0,
}


def load_domain_sensitivity() -> dict:
    """Calcule, pour chaque domaine, le nombre de catégories MEHARI qui le
    référencent, à partir de referentiels.json si le fichier est accessible.
    Retombe sur une table figée sinon (voir _FALLBACK_DOMAIN_SENSITIVITY).
    """
    try:
        with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
            kb = json.load(f)
        domains = set(kb.get("domains", {}).keys())
        sensitivity = {d: 0 for d in domains}
        for category in kb.get("mehari_categories", []):
            for domain in category.get("related_domains", []):
                sensitivity[domain] = sensitivity.get(domain, 0) + 1
        if sensitivity:
            return sensitivity
    except (OSError, json.JSONDecodeError, KeyError):
        pass
    return dict(_FALLBACK_DOMAIN_SENSITIVITY)


DOMAIN_SENSITIVITY = load_domain_sensitivity()
MAX_DOMAIN_SENSITIVITY = max(DOMAIN_SENSITIVITY.values()) if DOMAIN_SENSITIVITY else 1

MATURITY_LEVELS = [0, 1, 2, 3, 4]

# ---------------------------------------------------------------------------
# Endpoint 1 : cohérence déclaré / preuve
# ---------------------------------------------------------------------------

CONFIDENCE_FEATURE_NAMES = [
    "declared_level",
    "avg_evidence_level_filled",
    "avg_evidence_confidence_filled",
    "evidence_count",
    "gap",
    "domain_sensitivity",
]


def domain_sensitivity_of(domain: Optional[str]) -> int:
    if domain is None:
        return 0
    return DOMAIN_SENSITIVITY.get(domain.upper(), 0)


def build_confidence_features(
    declared_level: int,
    avg_evidence_level: Optional[float],
    avg_evidence_confidence: Optional[float],
    evidence_count: int,
    domain: Optional[str],
) -> np.ndarray:
    """Construit le vecteur de features envoyé au classifieur Gini.

    Règle centrale : quand il n'y a aucune pièce jointe (evidence_count == 0),
    le niveau démontré par les pièces est considéré comme 0 ("n'étaye rien"
    dans l'échelle de maturité), et on est sûr à 100% de cette absence de
    preuve (avg_evidence_confidence_filled = 1.0). Cela permet de traiter
    "déclaré élevé sans aucune pièce" avec la même notion d'écart que
    "déclaré élevé avec des pièces faibles", sans code spécial.
    """
    if evidence_count > 0:
        level_filled = 0.0 if avg_evidence_level is None else float(avg_evidence_level)
        confidence_filled = (
            0.5 if avg_evidence_confidence is None else float(avg_evidence_confidence)
        )
    else:
        level_filled = 0.0
        confidence_filled = 1.0

    gap = float(declared_level) - level_filled
    sensitivity = domain_sensitivity_of(domain)

    return np.array(
        [
            float(declared_level),
            level_filled,
            confidence_filled,
            float(evidence_count),
            gap,
            float(sensitivity),
        ],
        dtype=float,
    )


def generate_confidence_dataset(n: int = 6000, seed: int = 42):
    """Génère un jeu de données SYNTHÉTIQUE (bootstrap v1, voir README) qui
    encode des règles de bon sens avec du bruit, pour que l'arbre Gini
    apprenne une frontière de décision plutôt que de rejouer un if/else :

    - déclaré >> preuve (surtout avec des pièces jointes qui ne le soutiennent
      pas) -> incohérent ;
    - déclaré=0 sans preuve, ou déclaré <= preuve -> cohérent ;
    - déclaré élevé (3 ou 4) sans AUCUNE pièce -> suspect ;
    - un écart de ~1 point reste toléré ;
    - les domaines les plus "sensibles" (référencés par plusieurs catégories
      MEHARI) ont un seuil de tolérance légèrement plus strict.
    """
    rng = np.random.default_rng(seed)
    domains = list(DOMAIN_SENSITIVITY.keys()) + [None]  # None = question sans domaine

    declared = rng.integers(0, 5, size=n)
    evidence_count = rng.integers(0, 7, size=n)
    has_evidence = evidence_count > 0

    # Niveau de preuve : corrélé au hasard avec le déclaré pour avoir des cas
    # cohérents ET des cas d'écart, plutôt qu'une distribution indépendante.
    noise = rng.normal(loc=0.0, scale=1.3, size=n)
    avg_evidence_level_raw = np.clip(declared - noise, 0, 4)
    avg_evidence_level_raw = np.where(has_evidence, avg_evidence_level_raw, np.nan)

    avg_evidence_confidence_raw = np.where(
        has_evidence, rng.uniform(0.2, 1.0, size=n), np.nan
    )

    domain_choices = rng.choice(domains, size=n)

    X = np.zeros((n, len(CONFIDENCE_FEATURE_NAMES)), dtype=float)
    y = np.zeros(n, dtype=int)

    for i in range(n):
        dom = domain_choices[i]
        dom = None if dom == "None" else dom
        avg_level = None if not has_evidence[i] else float(avg_evidence_level_raw[i])
        avg_conf = None if not has_evidence[i] else float(avg_evidence_confidence_raw[i])

        features = build_confidence_features(
            int(declared[i]), avg_level, avg_conf, int(evidence_count[i]), dom
        )
        X[i] = features

        gap = features[CONFIDENCE_FEATURE_NAMES.index("gap")]
        confidence_filled = features[
            CONFIDENCE_FEATURE_NAMES.index("avg_evidence_confidence_filled")
        ]
        sensitivity = features[CONFIDENCE_FEATURE_NAMES.index("domain_sensitivity")]

        # Un écart n'est pesé pleinement que si la mesure de preuve qui le
        # sous-tend est fiable ; à l'inverse, l'absence totale de preuve
        # (confidence_filled=1.0 par construction) pèse pleinement.
        effective_gap = max(0.0, gap) * (0.5 + 0.5 * confidence_filled)

        # Tolérance de base 1.0, réduite pour les domaines les plus
        # "sensibles" (référencés par plusieurs catégories MEHARI), sans
        # jamais descendre sous 0.55 (on garde toujours une marge minimale).
        tolerance = max(0.55, 1.0 - 0.2 * sensitivity)

        score = 1.9 * (effective_gap - tolerance)
        p_flagged = 1.0 / (1.0 + np.exp(-score))

        label = 1 if rng.uniform() < p_flagged else 0
        # Bruit d'étiquetage : ~4% des cas sont retournés au hasard pour
        # simuler l'imperfection d'un vrai jeu d'audits (des humains ne
        # signaleraient pas toujours exactement la même chose).
        if rng.uniform() < 0.04:
            label = 1 - label
        y[i] = label

    return X, y


def generate_reason(
    declared_level: int,
    avg_evidence_level: Optional[float],
    avg_evidence_confidence: Optional[float],
    evidence_count: int,
    domain: Optional[str],
    flagged: bool,
) -> str:
    """Phrase FR lisible par un auditeur, calculée directement à partir des
    valeurs reçues (pas à partir de la structure de l'arbre)."""
    domain_suffix = f" (domaine {domain})" if domain else ""

    if evidence_count == 0:
        if flagged:
            return (
                f"Niveau déclaré ({declared_level}) élevé mais aucune pièce "
                f"jointe n'a été fournie pour l'étayer{domain_suffix}."
            )
        return (
            f"Niveau déclaré ({declared_level}) sans pièce jointe, jugé "
            f"cohérent avec l'absence de preuve attendue à ce niveau{domain_suffix}."
        )

    level_str = f"{avg_evidence_level:.1f}" if avg_evidence_level is not None else "0.0"
    pieces = f"{level_str}, {evidence_count} pièce(s) analysée(s)"
    gap = declared_level - (avg_evidence_level or 0.0)

    low_confidence_note = ""
    if avg_evidence_confidence is not None and avg_evidence_confidence < 0.5:
        low_confidence_note = (
            f" Fiabilité de l'analyse des pièces faible "
            f"(confiance {avg_evidence_confidence:.2f})."
        )

    if flagged:
        qualifier = "très supérieur" if gap > 2 else "supérieur"
        return (
            f"Niveau déclaré ({declared_level}) {qualifier} au niveau "
            f"démontré par les pièces ({pieces}).{low_confidence_note}{domain_suffix}."
        )

    if gap <= 0:
        return (
            f"Niveau déclaré ({declared_level}) cohérent avec le niveau "
            f"démontré par les pièces ({pieces}){domain_suffix}."
        )

    return (
        f"Écart modéré entre le niveau déclaré ({declared_level}) et le "
        f"niveau démontré par les pièces ({pieces}), dans la marge de "
        f"tolérance{domain_suffix}."
    )


# ---------------------------------------------------------------------------
# Endpoint 2 (secondaire) : cartographie des risques (KNN)
# ---------------------------------------------------------------------------

MEHARI_CATEGORIES = ["DISPONIBILITE", "INTEGRITE", "CONFIDENTIALITE", "TRACABILITE"]
PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "FTP", "SSH", "ICMP", "OTHER"]
RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

# Protocoles considérés en clair / plus exposés (pertinent surtout pour
# CONFIDENTIALITE et INTEGRITE) et catégories sensibles à la volumétrie.
_UNENCRYPTED_PROTOCOLS = {"HTTP", "FTP", "TCP", "UDP", "ICMP"}


def _encode(value: str, choices: list[str]) -> int:
    try:
        return choices.index(value.upper())
    except (ValueError, AttributeError):
        return len(choices)  # bucket "inconnu"


def build_cartography_features(
    category: str, protocol: str, occurrences: int, risk_level: str
) -> np.ndarray:
    return np.array(
        [
            _encode(category, MEHARI_CATEGORIES),
            _encode(protocol, PROTOCOLS),
            float(occurrences),
            _encode(risk_level, RISK_LEVELS),
        ],
        dtype=float,
    )


def _true_risk_level(category: str, protocol: str, occurrences: int) -> int:
    """Règle de base (bruitée à l'entraînement) utilisée pour fabriquer le
    jeu de données synthétique : plus d'occurrences => risque plus élevé,
    avec un bonus pour les protocoles non chiffrés sur les catégories
    intégrité/confidentialité, et pour les catégories liées à la
    disponibilité en cas de fort volume (déni de service)."""
    if occurrences < 5:
        level = 0
    elif occurrences < 15:
        level = 1
    elif occurrences < 30:
        level = 2
    else:
        level = 3

    if protocol.upper() in _UNENCRYPTED_PROTOCOLS and category.upper() in (
        "CONFIDENTIALITE",
        "INTEGRITE",
    ):
        level = min(3, level + 1)

    if category.upper() == "DISPONIBILITE" and occurrences > 25:
        level = min(3, level + 1)

    return level


def generate_cartography_dataset(n: int = 1500, seed: int = 7):
    rng = np.random.default_rng(seed)
    X = np.zeros((n, 4), dtype=float)
    y = np.zeros(n, dtype=int)
    for i in range(n):
        category = rng.choice(MEHARI_CATEGORIES)
        protocol = rng.choice(PROTOCOLS)
        occurrences = int(rng.integers(0, 60))
        true_level = _true_risk_level(category, protocol, occurrences)
        # Le riskLevel "déclaré" en entrée (issu des logs de scan) est bruité
        # autour du niveau réel : c'est ce que le KNN doit "raffiner".
        observed_level = int(np.clip(true_level + rng.integers(-1, 2), 0, 3))
        risk_level_in = RISK_LEVELS[observed_level]

        X[i] = build_cartography_features(category, protocol, occurrences, risk_level_in)
        y[i] = true_level
    return X, y
