#!/bin/sh
set -e

# Render expose les coordonnées de la base en variables séparées, mais JDBC
# attend une URL unique préfixée « jdbc:postgresql:// ». Un blueprint Render ne
# sait pas composer une variable à partir d'autres variables : la composition se
# fait donc ici, au démarrage du conteneur.
#
# DB_URL reste prioritaire si elle est fournie explicitement, ce qui permet de
# viser une base hors Render sans toucher à ce script.
if [ -z "$DB_URL" ] && [ -n "$DB_HOST" ]; then
    export DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
fi

# Le secret JWT n'a pas de valeur de repli acceptable en production : sans lui,
# application.properties retomberait sur le secret de développement, présent en
# clair dans le dépôt et donc connu de quiconque a accès au code.
if [ -z "$JWT_SECRET" ]; then
    echo "ERREUR : JWT_SECRET n'est pas défini. Démarrage interrompu." >&2
    exit 1
fi

exec java -XX:MaxRAMPercentage=70 -jar quarkus-run.jar
