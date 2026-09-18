# ocr-service

Microservice Python (FastAPI) qui lit le contenu des pièces justificatives
versées dans un audit CYBERAS — PDF et images — et évalue jusqu'à quel
niveau de maturité (0 à 4) cette pièce, telle qu'elle a pu être lue, permet
d'étayer une réponse au questionnaire.

**Ce que ce service ne fait pas** : il ne dit jamais qu'un document est
authentique, ni qu'une réponse est correcte. Il répond à une question plus
étroite : « qu'est-ce que le contenu extrait de ce fichier permet
d'établir ? ». C'est le même principe que les analyseurs déjà en place côté
backend (`HeuristicEvidenceAnalyzer`, `GeminiEvidenceAnalyzer`) : un niveau
démontré, jamais une preuve.

Appelé par `PythonOcrEvidenceAnalyzer.java` (`src/main/java/com/cyberas/domain/evidence/`),
qui bascule automatiquement sur l'analyseur heuristique si ce service est
indisponible, en panne, ou répond de façon inexploitable.

## Contrat HTTP

### `POST /analyze`

Requête :

```json
{
  "fileName": "politique-acces.pdf",
  "contentType": "application/pdf",
  "contentBase64": "<contenu du fichier encodé en base64>",
  "question": {
    "code": "ACC-01",
    "text": "Une politique de contrôle d'accès est-elle formalisée ?",
    "guidance": "On attend une gouvernance et une revue périodique des accès."
  }
}
```

`question` est optionnelle (pièce versée au dossier général, sans question
précise associée). `contentType` est toujours l'un de :
`application/pdf`, `image/png`, `image/jpeg`, `image/webp` (le Java filtre
les autres formats en amont et ne les envoie pas ici).

Réponse (200 uniquement — voir plus bas) :

```json
{
  "level": 2,
  "confidence": 0.65,
  "rationale": "Texte natif du PDF extrait (210 mots) ; indices de formalisation : date, structure en sections. Proximité lexicale correcte avec la question ACC-01 (similarité TF-IDF ≈ 0.21, mesure de vocabulaire, pas de compréhension du contenu).",
  "analyzer": "ocr-consistency-1.0"
}
```

- `level` : `0` à `4`, ou `null` si rien d'exploitable n'a pu être extrait
  (fichier vide, corrompu, page blanche, OCR infructueux).
- `confidence` : certitude sur la **lecture** (qualité OCR, longueur du
  texte extrait), pas sur la conformité du document.
- `rationale` : 1-2 phrases en français, pensées pour être lues aussi bien
  par l'auditeur que par l'audité.
- `analyzer` : toujours `"ocr-consistency-1.0"`.

**Codes HTTP** : seul `200` est traité comme une réponse exploitable côté
Java — tout autre code fait basculer sur l'analyseur heuristique de repli.
Un fichier vide, corrompu, ou une page blanche restent donc des réponses
`200` avec `level: null` (c'est un verdict, pas une panne). Un code `500`
est réservé à un vrai problème technique (Tesseract absent, bug interne).

### `GET /health`

```json
{"status": "ok"}
```

Utilisé par le healthcheck Docker / docker-compose.

## Lancer en local (sans Docker)

Prérequis : Python 3.11+, et le binaire **Tesseract** installé sur la
machine (pas seulement le paquet Python `pytesseract`, qui n'est qu'un
client) :

- Windows : [installeur UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki),
  puis s'assurer que `tesseract.exe` est dans le `PATH`, ou définir
  `pytesseract.pytesseract.tesseract_cmd` si besoin. Installer aussi les
  données linguistiques françaises (`fra.traineddata`) si l'installeur le
  propose, sinon l'OCR repliera silencieusement sur l'anglais avec une
  qualité dégradée sur du texte français.
- Linux (Debian/Ubuntu) : `sudo apt-get install tesseract-ocr tesseract-ocr-fra`.
- macOS : `brew install tesseract tesseract-lang`.

```bash
cd ocr-service
python -m venv .venv
source .venv/bin/activate        # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8500
```

Test rapide :

```bash
curl http://localhost:8500/health
```

## Lancer via Docker / docker-compose

Le `Dockerfile` installe le paquet système `tesseract-ocr` (+ `tesseract-ocr-fra`)
en plus des dépendances Python — pas besoin d'installer Tesseract sur la
machine hôte dans ce cas.

Le service, câblé dans `docker-compose.yml` à la racine du dépôt
(service `ocr-service`, port `8500:8500`), se lance avec le reste de la
stack :

```bash
docker compose up ocr-service
```

Ou seul, pour développer sur ce service isolément :

```bash
cd ocr-service
docker build -t cyberas-ocr-service .
docker run --rm -p 8500:8500 cyberas-ocr-service
```

Le port d'écoute est piloté par la variable d'environnement `PORT`
(défaut `8500`, valeur déjà fixée à `8500` dans `docker-compose.yml`).

## Comment ça lit le contenu

1. Décodage du base64, puis choix de la voie de lecture selon `contentType`.
2. **Images** (`image/png`, `image/jpeg`, `image/webp`) : OCR direct via
   `pytesseract` (français + anglais). Texte vide ou quasi vide (moins de
   20 caractères utiles) → `level: null`.
3. **PDF** : `PyMuPDF` (`fitz`) tente d'abord d'extraire la couche texte
   native — rapide, fiable, sans dépendance système supplémentaire (à la
   différence de `pdfplumber`/`poppler`). Si le texte natif utile fait
   moins de 50 caractères, le PDF est supposé scanné : chaque page (les
   8 premières au plus — voir « Limites » ci-dessous) est rendue en image
   via `page.get_pixmap()` puis passée à `pytesseract`.

## Méthode de scoring (v1) — et ses limites

Le code documente cette règle en détail dans `scoring.py` ; ce qui suit en
est le résumé assumé, y compris ses angles morts.

### Niveau (0-4)

Trois signaux combinés, tous **faibles pris isolément** :

1. **Volume de texte utile** — un texte de 20 mots n'établit pas la même
   chose qu'un document de 5 pages :
   `< 30 mots → 0`, `< 120 → 1`, `< 400 → 2`, `≥ 400 → 3`.
2. **Indices de formalisation**, détectés par expressions régulières
   simples : une date, une mention de signature/approbation, une structure
   en sections/articles, du vocabulaire de pilotage (« politique »,
   « procédure », « audit », « gouvernance »...). 3 ou 4 indices présents →
   `+1` ; aucun indice sur un texte pourtant long → `-1` (probablement un
   export brut, pas un document de pilotage).
3. **Cohérence avec la question** (si fournie) — similarité **lexicale**
   (TF-IDF + cosinus, `scikit-learn`) entre le texte extrait et
   `question.text` + `question.guidance`. Similarité haute → `+1` ;
   similarité très basse → `-1` (texte présent mais apparemment sans
   rapport avec la question).

Le résultat est toujours ramené dans `[0, 4]`.

**Ce que cette mesure de similarité N'est PAS** : c'est un recouvrement de
vocabulaire, pas une lecture sémantique. Un texte qui répond à la question
avec des synonymes obtiendra un score plus bas qu'il ne le devrait ; un
texte qui réemploie les mots de la question sans y répondre obtiendra un
score plus haut qu'il ne le devrait. Contrairement à un LLM (l'ancien
`GeminiEvidenceAnalyzer`), ce service ne comprend pas le texte : il compte
des mots.

### Confiance (0.0-1.0)

Porte sur la **lecture**, pas sur la conformité :

- Texte natif d'un PDF : confiance de base haute (pas d'OCR, donc pas
  d'erreur de reconnaissance de caractères).
- Texte obtenu par OCR : bornée par la confiance moyenne renvoyée par
  Tesseract (quand disponible), sinon une valeur prudente par défaut.
- Pénalités : texte court, basse résolution d'image (< ~400×400 px,
  heuristique non calibrée).

Le Java (`PythonOcrEvidenceAnalyzer`) replafonne de toute façon cette
valeur à `0.75` avant de la restituer : entre l'heuristique sur métadonnées
(plafond `0.55`, qui ne lit rien) et l'ancien Gemini (plafond `0.85`, qui
comprenait le texte), cette lecture OCR + mesure lexicale se situe
au milieu.

### Limites explicites de cette v1

- Les seuils (30/120/400 mots, 0.03/0.15 de similarité, 400×400 px) sont
  des heuristiques de bon sens, pas des valeurs calibrées sur un corpus
  réel. Ils sont probablement à ajuster une fois confrontés à de vraies
  pièces d'audit.
- Le vocabulaire de formalisation (`COMMITTING_TERMS` dans `scoring.py`)
  est une liste française fixe et non exhaustive.
- La similarité TF-IDF ne retire pas les mots vides français (scikit-learn
  n'embarque nativement que des stop-words anglais) : des mots très
  fréquents mais peu informatifs peuvent peser dans le score.
- Un PDF scanné de plus de 8 pages n'est OCRisé que sur ses 8 premières
  pages (`MAX_OCR_PAGES` dans `extraction.py`), pour borner le temps de
  réponse. Un document de référence dont l'essentiel du contenu est plus
  loin dans le fichier sera sous-évalué.
- Aucune détection de mise en page avancée (tableaux, cases à cocher,
  signatures manuscrites en tant qu'image) : tout est traité comme du texte
  brut.

## Tests

```bash
cd ocr-service
pip install -r requirements-dev.txt
pytest
```

Couverts :

- `GET /health`.
- Contenu vide → `level: null`, `200` (pas d'erreur HTTP).
- PDF corrompu (octets aléatoires) → `level: null`, `200`.
- Base64 invalide → `level: null`, `200`.
- PDF généré à la volée (`fpdf2`) avec un texte long, daté et structuré →
  `level` non nul, cohérent avec la règle de `scoring.py`.
- Image PNG générée à la volée (`Pillow`) avec du texte → réponse valide
  dans le contrat ; ce test est ignoré (`skip`) si Tesseract n'est pas
  installé sur la machine qui exécute les tests, l'absence du binaire étant
  une question d'environnement et non un bug du service.
