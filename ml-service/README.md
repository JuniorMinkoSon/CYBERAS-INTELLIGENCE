# CYBERAS ML Service

Microservice Python autonome (FastAPI) qui fournit des indices consultatifs
basés sur du machine learning « classique » et interprétable, en complément
du moteur de risque déterministe de CYBERAS (`RiskEngine.java`).

## Pourquoi ce service existe, et ce qu'il n'est pas

CYBERAS s'appuie sur un principe de conception assumé : **un score qu'on ne
peut pas recalculer à la main n'est pas défendable en audit**. `RiskEngine`
reste donc entièrement déterministe et ce service ne le modifie jamais, ne
l'appelle jamais, et n'est jamais dans le chemin critique d'un audit :
`AnswerConfidenceClient.java` retombe sur `Optional.empty()` si ce service
est absent ou en panne — l'indice de confiance est une information
**en plus**, jamais une condition pour consulter ou clôturer un audit.

Pourquoi un arbre à critère Gini (`RandomForestClassifier(criterion="gini")`)
plutôt qu'un LLM :

- **Interprétabilité** : chaque décision se retrace à des seuils sur des
  features numériques simples (écart déclaré/preuve, nombre de pièces,
  sensibilité du domaine). Un auditeur peut comprendre *pourquoi* un cas est
  signalé.
- **Pas d'hallucination** : un LLM pourrait produire un verdict plausible
  mais non fondé sur les valeurs réellement reçues. Ici, le verdict est un
  calcul reproductible sur des nombres, et la phrase `reason` renvoyée est
  elle-même calculée directement à partir des valeurs de la requête (pas
  générée par le modèle ni par un LLM).
- **Cohérence avec la philosophie du projet** : ce service applique la même
  exigence de traçabilité que `RiskEngine`, à un niveau différent (indice
  consultatif plutôt que score d'audit).

## Endpoints

### `POST /confidence/questionnaire-answer` (principal)

Signale les réponses au questionnaire d'audit dont le niveau de maturité
**déclaré** par l'audité (0 à 4) semble statistiquement incohérent avec le
niveau **démontré** par l'analyse des pièces jointes (0 à 4, moyenné).

Requête :

```json
{
  "domain": "ACCESS",
  "declaredLevel": 4,
  "avgEvidenceLevel": 1.0,
  "avgEvidenceConfidence": 0.6,
  "evidenceCount": 2
}
```

Tous les champs sauf `evidenceCount` peuvent être `null` (`domain` si la
question n'a pas de domaine renseigné ; `avgEvidenceLevel` /
`avgEvidenceConfidence` valent `null` quand `evidenceCount` vaut 0).

Réponse (`200` uniquement) :

```json
{
  "confidenceIndex": 0.22,
  "flagged": true,
  "reason": "Niveau déclaré (4) très supérieur au niveau démontré par les pièces (1.0, 2 pièce(s) analysée(s)).",
  "model": "gini-tree-1.0"
}
```

- `confidenceIndex` : 0.0 (très incohérent) à 1.0 (parfaitement cohérent).
- `flagged` : `true` si le cas mérite un regard humain.
- `reason` : phrase en français calculée à partir des valeurs reçues (écart
  déclaré/preuve, nombre de pièces, domaine), pas un texte statique.
- `model` : toujours `"gini-tree-1.0"`.

### `POST /risk-cartography/classify` (secondaire)

Raffine, par un simple `KNeighborsClassifier`, un niveau de risque MEHARI
simplifié (`DISPONIBILITE`, `INTEGRITE`, `CONFIDENTIALITE`, `TRACABILITE`)
observé dans des logs de scan.

Requête :

```json
{"category": "DISPONIBILITE", "protocol": "UDP", "occurrences": 12, "riskLevel": "MEDIUM"}
```

Réponse :

```json
{"suggestedRiskLevel": "HIGH", "neighbors": 5, "model": "knn-1.0"}
```

Ce endpoint est volontairement sommaire (jeu synthétique restreint, pas
d'enrichissement particulier) : c'est un complément secondaire au endpoint
de cohérence des réponses, qui reste la priorité de ce service.

### `GET /health`

`{"status": "ok"}`.

## Le modèle est un bootstrap synthétique (v1) — à remplacer par des données réelles

**Aucune donnée d'audit réelle n'existe encore** au moment de l'écriture de
ce service (produit en cours de déploiement). `train.py` génère donc un jeu
de données **synthétique**, construit à partir de règles de bon sens
volontairement bruitées (pour que le modèle apprenne une frontière de
décision plutôt que de rejouer un `if/else` déguisé) :

- déclaré très supérieur à la preuve moyenne (ex. déclaré=4, preuve≈0-1),
  surtout si des pièces ont été fournies et ne le soutiennent pas →
  incohérent ;
- déclaré=0 sans aucune preuve, ou déclaré ≤ preuve démontrée → cohérent ;
- déclaré élevé (3 ou 4) avec `evidenceCount == 0` (aucune pièce jointe du
  tout) → suspect également (affirmation forte non étayée) ;
- un écart de l'ordre de 1 point reste toléré (marge de tolérance) ;
- un domaine référencé par plusieurs catégories MEHARI simplifiées (via
  `data/knowledge-base/referentiels.json`, ex. `ACCESS` ou `DATA`) est traité
  comme légèrement plus « sensible » : le seuil de tolérance y est un peu
  plus strict. Cet enrichissement est **best-effort** : si ce fichier n'est
  pas accessible depuis l'image Docker du service (le contexte de build ne
  couvre que `ml-service/`), une table de repli figée dans
  `ml_common.py::_FALLBACK_DOMAIN_SENSITIVITY` reproduit les mêmes valeurs, de
  sorte que le comportement du service ne dépend jamais de la présence de ce
  fichier au runtime.

Le module `ml_common.py` centralise cette logique (`generate_confidence_dataset`,
`build_confidence_features`, `generate_reason`) pour qu'elle soit partagée à
l'identique entre `train.py` (entraînement) et `main.py` (service HTTP).

### Ré-entraîner sur des données réelles

Dès que des données réelles seront disponibles côté Java (réponses au
questionnaire historisées avec leur niveau de preuve analysé, en base
PostgreSQL), remplacer la génération synthétique par un export réel :

1. Exporter, pour chaque réponse historisée, les colonnes équivalentes à
   celles du contrat HTTP depuis les tables `questionnaire_answers` (domaine,
   niveau déclaré) et `documents` / `evidences` (niveau de preuve estimé par
   pièce, confiance de l'analyse, nombre de pièces par réponse) — avec, en
   plus, une colonne « signalé par un auditeur humain » ou « écart confirmé »
   qui servira d'étiquette (`y`).
2. Dans `train.py`, remplacer l'appel à
   `ml_common.generate_confidence_dataset()` par le chargement de cet export
   (CSV/Parquet), puis reconstruire les features avec
   `ml_common.build_confidence_features(...)` ligne par ligne pour rester
   strictement cohérent avec ce que `main.py` calcule au moment de la
   prédiction.
3. Relancer `python train.py` : les fichiers dans `ml-service/models/` sont
   regénérés. Aucun autre fichier n'a besoin de changer (le contrat HTTP et
   `main.py` restent identiques).
4. Faire de même pour `cartography_model.joblib` à partir des logs de scan
   réels et de la cartographie de risques validée, une fois disponible.

Le champ `"model": "gini-tree-1.0"` (et `"knn-1.0"`) est à incrémenter
(`gini-tree-1.1`, `2.0`, ...) à chaque ré-entraînement significatif, pour
que le champ reste traçable côté audit.

## Lancer le service localement

```bash
cd ml-service
python -m venv .venv
. .venv/Scripts/activate   # ou source .venv/bin/activate sous Linux/macOS
pip install -r requirements.txt

# Optionnel : entraîner explicitement avant de démarrer (sinon main.py le
# fait automatiquement au premier démarrage si ml-service/models/ est vide).
python train.py

python main.py             # écoute sur $PORT (défaut 8600)
```

Le service écoute par défaut sur le port `8600`, déjà câblé dans
`docker-compose.yml` (service `ml-service`, `8600:8600`, `ML_SERVICE_URL`
consommé par `AnswerConfidenceClient.java` côté Java).

## Tester

```bash
cd ml-service
pip install -r requirements.txt pytest
pytest -v
```

`tests/test_confidence.py` couvre notamment :

- un cas clairement cohérent (déclaré=1, preuve≈1, 2 pièces) → `flagged: false` ;
- un cas clairement incohérent (déclaré=4, preuve≈0, 2 pièces) → `flagged: true` ;
- l'absence totale de pièces (déclaré=0 → cohérent ; déclaré=4 → signalé) ;
- les champs `null` (`declaredLevel` absent notamment) ;
- un appel basique au endpoint secondaire `/risk-cartography/classify`.

## Docker

```bash
docker compose up ml-service --build
```

Le `Dockerfile` exécute `train.py` au build (le service démarre déjà
« chaud », modèles prêts). Si les fichiers `.joblib` sont malgré tout absents
au démarrage (volume monté vide, etc.), `main.py` les entraîne lui-même à la
volée au premier appel qui en a besoin — le service fonctionne toujours
« out of the box », sans étape manuelle obligatoire.

## Arborescence

```
ml-service/
├── main.py            # FastAPI : /confidence/questionnaire-answer, /risk-cartography/classify, /health
├── train.py            # génère les jeux synthétiques, entraîne, sauvegarde (joblib)
├── ml_common.py         # features, génération synthétique, phrases `reason`, partagé main.py/train.py
├── requirements.txt
├── Dockerfile
├── models/              # modèles entraînés (.joblib), générés par train.py
└── tests/
    └── test_confidence.py
```
