"""
Entraîne et sauvegarde (joblib, dans ml-service/models/) les deux modèles du
service ML de CYBERAS :

1. confidence_model.joblib : RandomForestClassifier (critère Gini) qui
   signale les réponses au questionnaire dont le niveau déclaré est
   statistiquement incohérent avec le niveau démontré par les pièces jointes.
   C'est le modèle principal, entraîné soigneusement.

2. cartography_model.joblib : KNeighborsClassifier (secondaire, sommaire) qui
   raffine un niveau de risque MEHARI à partir de logs de scan.

IMPORTANT — jeu de données synthétique (bootstrap v1) :
Aucune donnée réelle n'existe encore pour ces deux modèles (produit en cours
de déploiement). Les jeux d'entraînement sont générés par des règles de bon
sens + du bruit (voir ml_common.generate_confidence_dataset et
generate_cartography_dataset). Voir README.md pour la procédure de
ré-entraînement sur données réelles.

Usage :
    python train.py
"""
from __future__ import annotations

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

from ml_common import (
    CARTOGRAPHY_MODEL_PATH,
    CONFIDENCE_MODEL_PATH,
    generate_cartography_dataset,
    generate_confidence_dataset,
)


def train_confidence_model(save: bool = True) -> RandomForestClassifier:
    X, y = generate_confidence_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100,
        criterion="gini",
        max_depth=5,
        min_samples_leaf=10,
        random_state=42,
    )
    model.fit(X_train, y_train)

    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(
        f"[confidence_model] train_acc={train_acc:.3f} test_acc={test_acc:.3f} "
        f"(n_train={len(y_train)}, n_test={len(y_test)}, "
        f"flagged_rate={np.mean(y):.2%})"
    )

    if save:
        joblib.dump(model, CONFIDENCE_MODEL_PATH)
        print(f"[confidence_model] sauvegardé -> {CONFIDENCE_MODEL_PATH}")
    return model


def train_cartography_model(save: bool = True) -> KNeighborsClassifier:
    X, y = generate_cartography_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y
    )

    model = KNeighborsClassifier(n_neighbors=5)
    model.fit(X_train, y_train)

    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(
        f"[cartography_model] train_acc={train_acc:.3f} test_acc={test_acc:.3f} "
        f"(n_train={len(y_train)}, n_test={len(y_test)})"
    )

    if save:
        joblib.dump(model, CARTOGRAPHY_MODEL_PATH)
        print(f"[cartography_model] sauvegardé -> {CARTOGRAPHY_MODEL_PATH}")
    return model


def main() -> None:
    train_confidence_model()
    train_cartography_model()


if __name__ == "__main__":
    main()
