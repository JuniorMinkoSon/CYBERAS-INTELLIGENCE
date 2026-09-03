# syntax=docker/dockerfile:1

# Image du backend Quarkus seul. Le frontend React est déployé séparément sur
# Vercel : l'inclure ici publierait une seconde copie du site, figée à la date
# du dernier build backend, à une URL concurrente de celle de Vercel.

# ---- Étape 1 : build du backend Quarkus ----
FROM maven:3.9-eclipse-temurin-21 AS backend-build
# Miroir Maven optionnel (utile si repo.maven.apache.org est limité) :
#   docker build --build-arg MAVEN_MIRROR=https://maven-central.storage-download.googleapis.com/maven2/ .
ARG MAVEN_MIRROR=
RUN if [ -n "$MAVEN_MIRROR" ]; then \
      mkdir -p /root/.m2 && \
      printf '<settings><mirrors><mirror><id>mirror</id><mirrorOf>central</mirrorOf><url>%s</url></mirror></mirrors></settings>' "$MAVEN_MIRROR" > /root/.m2/settings.xml; \
    fi
WORKDIR /build
# Le pom seul d'abord : cette couche est mise en cache tant que les dépendances
# ne bougent pas, ce qui évite de les retélécharger à chaque build.
COPY pom.xml ./
RUN mvn -q dependency:go-offline || true
COPY src ./src
RUN mvn -q package -DskipTests

# ---- Étape 2 : image d'exécution ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /build/target/quarkus-app/lib/ ./lib/
COPY --from=backend-build /build/target/quarkus-app/*.jar ./
COPY --from=backend-build /build/target/quarkus-app/app/ ./app/
COPY --from=backend-build /build/target/quarkus-app/quarkus/ ./quarkus/
# Le port effectif vient de la variable PORT fournie par l'hébergeur ;
# 8081 n'est que la valeur de repli déclarée dans application.properties.
EXPOSE 8081
# Le script compose l'URL JDBC à partir des variables de l'hébergeur et refuse
# de démarrer sans JWT_SECRET.
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
