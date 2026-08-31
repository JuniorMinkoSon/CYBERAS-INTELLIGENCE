# CYBERAS Audit Service - PHASE 2 SOCLE

## État de l'implémentation

### ✅ Complété (PHASE 2)

#### Configuration
- ✅ `application.properties` - Configuration PostgreSQL, JWT, Redis, Kafka, Prometheus
- ✅ `application-dev.properties` - Profile développement
- ✅ `docker-compose.yml` - Services locaux (PostgreSQL, Kafka, Redis, UI optionnelles)
- ✅ `V1__Initial_Schema.sql` - Migrations Flyway pour les tables de base

#### Entités JPA
- ✅ `Organization.java` - Organisations conteneur
- ✅ `User.java` - Utilisateurs avec authentification
- ✅ `Role.java` - Rôles personnalisés par organisation
- ✅ `Permission.java` - Permissions granulaires
- ✅ `UserRole.java` - Association User ↔ Role avec expiration
- ✅ `Audit.java` - Missions d'audit
- ✅ `AuditVersion.java` - Versions immuables des audits
- ✅ `AccessGrant.java` - Droits d'accès granulaires et versionés
- ✅ `AuditEvent.java` - Traçabilité complète (audit trail)

#### Repositories (Data Access)
- ✅ `OrganizationRepository.java` - CRUD organisations
- ✅ `UserRepository.java` - CRUD + requêtes spécifiques utilisateurs
- ✅ `RoleRepository.java` - CRUD + requêtes rôles
- ✅ `AuditRepository.java` - CRUD + requêtes audits

#### Sécurité & JWT
- ✅ `JwtUtils.java` - Génération/validation JWT + claims extraction
- ✅ `JwtContext.java` - Context request-scoped pour utilisateur courant
- ✅ `JwtFilter.java` - Filtre REST pour valider tokens + popupler contexte

#### Services métier
- ✅ `AuthService.java` - Login, register, refresh token, change password

#### API REST
- ✅ `AuthResource.java` - Endpoints `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/change-password`

#### Dépendances Maven
- ✅ Quarkus Flyway pour migrations SQL
- ✅ java-jwt 4.4.0 pour JWT manual
- ✅ jbcrypt 0.4 pour password hashing
- ✅ quarkus-logging-json pour logs structurés

---

## Architecture PHASE 2

### Stack technique
```
React/TypeScript (Frontend - à venir)
        ↓
REST API (Quarkus 3.38.1)
        ↓
Security Layer (JWT Filter + Context)
        ↓
Service Layer (AuthService, UserService, etc.)
        ↓
Repository Layer (Panache Repository)
        ↓
PostgreSQL 16 + Flyway Migrations
        ↓
Kafka (Event streaming)
Redis (Caching/Sessions)
```

### Base de données
```
organizations (table 1)
  ├── roles (N)
  ├── permissions (N)
  ├── users (N)
  │   ├── user_roles (M)
  │   ├── access_grants (M)
  │   └── audit_events (M)
  └── audits (N)
      ├── audit_versions (M) - Immuables
      ├── access_grants (M) - Granulaires
      └── audit_events (M) - Traçabilité

Indices : org, user, audit, timestamp, status pour performance
```

---

## PHASE 3 Prochaine (À faire)

### Services supplémentaires à implémenter
- `UserService` - Gestion utilisateurs complets
- `OrganizationService` - Gestion organisations
- `RoleService` - Attribution/suppression de rôles
- `AuditService` - Gestion missions + versioning
- `AccessGrantService` - Gestion des droits d'accès

### Endpoints REST supplémentaires
```
GET  /users                    # Lister utilisateurs (avec RBAC)
POST /users                    # Créer utilisateur
GET  /users/{id}              # Détails utilisateur
PUT  /users/{id}              # Modifier utilisateur
DEL  /users/{id}              # Supprimer utilisateur

GET  /organizations            # Lister organisations
POST /organizations            # Créer orga
GET  /organizations/{id}      # Détails orga
PUT  /organizations/{id}      # Modifier orga

GET  /roles                    # Lister rôles
POST /roles                    # Créer rôle
PUT  /roles/{id}              # Modifier rôle

GET  /audits                   # Lister missions (avec tenant isolation)
POST /audits                   # Créer mission
GET  /audits/{id}             # Détails mission
PUT  /audits/{id}             # Modifier mission
POST /audits/{id}/versions    # Créer version
GET  /audits/{id}/versions    # Lister versions

POST /access-grants            # Créer AccessGrant + générer code d'accès
GET  /access-grants/{id}      # Détails accès
PUT  /access-grants/{id}      # Modifier accès
DEL  /access-grants/{id}      # Révoquer accès
```

---

## Comment démarrer

### 1. Préparation
```bash
# Cloner et aller dans le répertoire
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service

# Démarrer les services docker
docker-compose up -d

# Attendre que les services soient healthy
docker-compose ps
```

### 2. Compilation & Build
```bash
# Compilation
mvn clean compile

# Build JAR
mvn clean package

# Lancer en dev mode
mvn quarkus:dev
```

### 3. Endpoints de test
```bash
# Health check
curl http://localhost:8080/q/health

# OpenAPI/Swagger
http://localhost:8080/q/swagger-ui.html

# Créer une orga d'abord (à faire: endpoint admin)

# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cyberas.local",
    "username": "admin",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "organizationId": "00000000-0000-0000-0000-000000000001"
  }'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cyberas.local",
    "password": "SecurePassword123!",
    "organizationId": "00000000-0000-0000-0000-000000000001"
  }'

# Utiliser le JWT dans les headers
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:8080/users
```

---

## Points importants à retenir

### Sécurité
- JWT est utilisé pour l'authentication stateless
- JwtFilter valide les tokens sur TOUS les endpoints sauf `/auth`, `/q/*`, `/swagger`, `/openapi`
- JwtContext est request-scoped et contient les infos utilisateur courant
- Tenant isolation : toujours filtrer par `organization_id`

### Traçabilité
- AuditEvent enregistre TOUTE action (création, modification, suppression, login, etc.)
- Chaque event contient : actor, resource, action, timestamp, correlationId
- Les données IA analysées doivent pointer vers leurs sources via evidenceRefs

### Versioning des audits
- Un Audit peut avoir plusieurs AuditVersions immuables
- Chaque version verrouille les données
- Un parent_version_id permet de tracer l'historique
- Le hash garantit l'intégrité

### AccessGrants
- Entité centrale pour les droits granulaires
- Peut être limité par version d'audit
- Peut avoir un profile de scan (NONE, BASIC, STANDARD, FULL)
- Peut expirer
- Peut être révoqué

### Configuration
- application.properties : production defaults (validé)
- application-dev.properties : overrides local dev (DB drop-create, logs DEBUG)
- En prod : surcharger `jwt.secret`, database credentials, Kafka hosts via env vars

---

## Prochaines étapes (après compilation réussie)

1. ✅ Vérifier que `mvn clean package` réussit
2. ✅ Vérifier que `docker-compose up` démarre les services
3. ✅ Tester le lancement avec `mvn quarkus:dev`
4. ✅ Tester les endpoints de base (register, login)
5. ✅ PHASE 3 : Implémentation des services complets
6. ✅ PHASE 4 : Scanners réels (Nmap, ZAP)
7. ✅ PHASE 5 : Finding Engine + Corrélation
8. ✅ PHASE 6 : Questionnaires
9. ✅ PHASE 7 : IA Gemini
10. ✅ PHASE 8 : RAG + Knowledge Base
