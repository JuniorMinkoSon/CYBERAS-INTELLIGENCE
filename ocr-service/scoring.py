"""Passage du texte extrait à un niveau démontré (0-4) et à une confiance.

Ce module documente une règle **v1, volontairement simple et lisible**,
dans l'esprit de `HeuristicEvidenceAnalyzer.java` côté backend (qui combine
lui aussi format, mots-clés et fraîcheur plutôt qu'un modèle opaque). Elle
combine trois signaux, tous faibles pris isolément :

1. Le volume de texte exploitable (un fichier vide ou une ligne isolée
   n'établit pas la même chose qu'un document de plusieurs pages).
2. Des indices de formalisation détectés par expressions régulières : une
   date, une mention de signature/approbation, une structure en sections,
   du vocabulaire de pilotage (« politique », « procédure », « audit »...).
3. Si une question est fournie, la proximité lexicale (TF-IDF + cosinus)
   entre le texte extrait et l'intitulé/la consigne de la question.

**Limite assumée** : rien ici ne « comprend » le document. Un texte qui
réemploie les mots de la question sans y répondre obtient le même score
qu'un texte qui y répond réellement ; un texte qui y répond avec des
synonymes obtient un score plus bas qu'il ne le devrait. C'est une mesure de
vocabulaire partagé, pas de sens. Voir le README pour la discussion complète.
"""

from __future__ import annotations

import re
from typing import List, Optional, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Indices de formalisation (regex simples, volontairement lisibles).
# ---------------------------------------------------------------------------

DATE_PATTERN = re.compile(
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}"
    r"|janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t"
    r"|septembre|octobre|novembre|d[ée]cembre)\b",
    re.IGNORECASE,
)

SIGNATURE_PATTERN = re.compile(
    r"\b(sign[ée]e?|signature|approuv[ée]e?|valid[ée]e?\s+par|cachet|tampon|visa)\b",
    re.IGNORECASE,
)

HEADING_PATTERN = re.compile(
    r"(^|\n)\s*(\d+(\.\d+)*\.?\s|article\s+\d+|chapitre\s+\d+|section\s+\d+"
    r"|sommaire|table\s+des\s+mati[eè]res|annexe|objet\s*:)",
    re.IGNORECASE,
)

COMMITTING_TERMS = [
    "politique", "procedure", "procédure", "charte", "rapport", "registre",
    "attestation", "certificat", "audit", "revue", "plan de", "matrice",
    "gouvernance", "controle", "contrôle", "engagement", "conformite",
    "conformité", "proces-verbal", "procès-verbal",
]

# Seuil de similarité TF-IDF au-delà duquel on considère la proximité
# lexicale avec la question comme suffisante pour créditer un niveau
# supplémentaire. En dessous du seuil bas, le texte semble sans rapport.
SIMILARITY_HIGH = 0.15
SIMILARITY_LOW = 0.03

# Une image ou une page rendue en dessous de cette surface (en pixels) est
# jugée basse résolution : l'OCR y est structurellement moins fiable, d'où
# une pénalité de confiance. Seuil heuristique (~400x400 px), pas une mesure
# calibrée.
LOW_RESOLUTION_PIXELS = 400 * 400


def structuration_indicators(text: str) -> Tuple[int, List[str]]:
    """Compte les catégories d'indices de formalisation présentes (0 à 4)."""
    labels: List[str] = []
    if DATE_PATTERN.search(text):
        labels.append("date")
    if SIGNATURE_PATTERN.search(text):
        labels.append("signature ou approbation")
    if HEADING_PATTERN.search(text):
        labels.append("structure en sections")
    lowered = text.lower()
    if any(term in lowered for term in COMMITTING_TERMS):
        labels.append("vocabulaire de pilotage")
    return len(labels), labels


def lexical_similarity(text: str, query: str) -> Optional[float]:
    """Similarité cosinus TF-IDF entre le texte extrait et la question.

    Mesure purement lexicale : elle compte du vocabulaire partagé, elle ne
    lit pas le sens. Retourne None si l'un des deux textes est vide (rien à
    comparer), 0.0 si le vocabulaire est trop pauvre pour construire un
    espace TF-IDF (ex: texte réduit à des tokens ignorés).
    """
    text = (text or "").strip()
    query = (query or "").strip()
    if not text or not query:
        return None

    try:
        vectorizer = TfidfVectorizer()
        matrix = vectorizer.fit_transform([text, query])
        if matrix.shape[1] == 0:
            return 0.0
        score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return float(max(0.0, min(1.0, score)))
    except ValueError:
        return 0.0


def compute_level(word_count: int, structuration_count: int, similarity: Optional[float]) -> int:
    """Mapping documenté vers un niveau 0-4.

    1. Base sur le volume de texte utile :
       - < 30 mots   -> 0 (quasiment rien à lire)
       - < 120 mots  -> 1 (bribe de contenu)
       - < 400 mots  -> 2 (document consistant)
       - >= 400 mots -> 3 (document développé)
    2. Ajustement formalisation :
       - 3 ou 4 indices présents (date, signature, structure, vocabulaire)
         -> +1 (plafonné à 4) : un texte long ET formalisé va au-delà d'un
         texte long mais informe.
       - 0 indice sur un texte pourtant long (niveau >= 2) -> -1 : du volume
         sans aucune trace de formalisation est probablement un export brut,
         pas un document de pilotage.
    3. Ajustement cohérence avec la question, si fournie :
       - similarité >= 0.15 -> +1 (plafonné à 4)
       - similarité <  0.03 -> -1 (texte présent mais apparemment sans
         rapport avec la question posée)

    Le résultat est toujours ramené dans [0, 4].
    """
    if word_count < 30:
        level = 0
    elif word_count < 120:
        level = 1
    elif word_count < 400:
        level = 2
    else:
        level = 3

    if structuration_count >= 3:
        level += 1
    elif structuration_count == 0 and level >= 2:
        level -= 1

    if similarity is not None:
        if similarity >= SIMILARITY_HIGH:
            level += 1
        elif similarity < SIMILARITY_LOW:
            level -= 1

    return max(0, min(4, level))


def compute_confidence(
    source: str,
    word_count: int,
    mean_ocr_confidence: Optional[float],
    pixel_area: Optional[float],
) -> float:
    """Confiance sur la LECTURE (pas sur la conformité du document).

    - Texte natif d'un PDF (`pdf_native`) : pas d'OCR, donc pas d'erreur de
      reconnaissance de caractères. Confiance de base haute.
    - Texte OCRisé (`pdf_ocr`, `ocr_image`) : bornée par la confiance
      moyenne renvoyée par Tesseract quand elle est disponible, sinon une
      valeur moyenne prudente.
    - Pénalités : texte court (davantage de doute sur la représentativité de
      ce qui a été lu) et basse résolution d'image (l'OCR y est
      structurellement moins fiable).

    Le Java (`PythonOcrEvidenceAnalyzer`) replafonne de toute façon cette
    valeur à 0,75 : la lecture OCR ne prétend jamais à la certitude qu'aurait
    une vérification humaine.
    """
    if source == "pdf_native":
        confidence = 0.85
    else:
        confidence = (mean_ocr_confidence / 100.0) if mean_ocr_confidence is not None else 0.5

    if word_count < 50:
        confidence -= 0.25
    elif word_count < 150:
        confidence -= 0.10

    if pixel_area is not None and pixel_area < LOW_RESOLUTION_PIXELS:
        confidence -= 0.15

    return round(max(0.05, min(0.95, confidence)), 2)


def build_rationale(
    source: str,
    word_count: int,
    structuration_labels: List[str],
    similarity: Optional[float],
    question_code: Optional[str],
) -> str:
    """Phrase(s) en français, lisibles par un auditeur ET par l'audité."""
    lecture = {
        "pdf_native": "Texte natif du PDF extrait",
        "pdf_ocr": "PDF scanné, texte obtenu par OCR",
        "ocr_image": "Image, texte obtenu par OCR",
    }.get(source, "Texte extrait")

    if structuration_labels:
        indices = ", ".join(structuration_labels)
        phrase1 = f"{lecture} ({word_count} mots) ; indices de formalisation : {indices}."
    else:
        phrase1 = (
            f"{lecture} ({word_count} mots) ; aucun indice de formalisation détecté "
            "(date, signature, structure)."
        )

    phrase2 = ""
    if similarity is not None:
        if similarity >= SIMILARITY_HIGH:
            qualif = "correcte"
        elif similarity < SIMILARITY_LOW:
            qualif = "très faible"
        else:
            qualif = "faible à modérée"
        code = f" {question_code}" if question_code else ""
        phrase2 = (
            f" Proximité lexicale {qualif} avec la question{code} "
            f"(similarité TF-IDF ≈ {similarity:.2f}, mesure de vocabulaire, pas de "
            "compréhension du contenu)."
        )

    return phrase1 + phrase2
