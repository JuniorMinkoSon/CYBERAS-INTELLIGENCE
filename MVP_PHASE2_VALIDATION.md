# MVP PHASE 2 — FINALISATION ET VALIDATION CYBERAS INTELLIGENCE

**Objectif Global:** Conclure le MVP avec validation runtime complète. Aucune refonte, uniquement tests + corrections blockers.

**Statut Actuel (pré-Phase 2):**
- ✅ Architecture single-organization
- ✅ JWT authentication avec organizationId
- ✅ Unified /app
- ✅ API clients réels (no mocks)
- ✅ Mode démo supprimé complètement
- ✅ Jakarta validation
- ✅ CORS + rate limiting + audit trail
- ✅ Multi-tenant isolation
- ✅ Risk Engine déterministe
- ✅ Frontend build OK (426.86 kB JS, 63.57 kB CSS)
- ✅ Backend compile OK (92 sources)

---

## PHASE 2.1 — RÉSOUDRE LE 404 AUTH [RUNTIME]

### État Actuel (Diagnostic Statique)
```
✅ BACKEND Path OK:
  - quarkus.rest.path=/api
  - AuthResource @Path("/auth")
  - Endpoints: /api/auth/login, /api/auth/register

✅ FRONTEND Config OK:
  - apiClient baseUrl=/api
  - fetch baseUrl correctly set

✅ VITE Proxy OK:
  - /api → http://localhost:8080
```

### Action Requise (USER)

**Terminal 1 — Postgres + Redis:**
```bash
docker-compose up postgres redis kafka
```

**Terminal 2 — Quarkus Dev:**
```bash
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service
mvn quarkus:dev
```

⚠️ **NOTER:** Cherchez la ligne exacte `Listening on: http://0.0.0.0:XXXX`

**Terminal 3 — Frontend Dev:**
```bash
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service\frontend
npm run dev
```

### Test Direct (Curl)

**Test 2.1.1 — Login Endpoint:**
```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.local\",\"password\":\"test\"}"
```

**COPIER:** Status HTTP + Response Body complet

**Test 2.1.2 — Register Endpoint:**
```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test-register@test.local\",\"password\":\"Test123456!\",\"organizationName\":\"Test Organization\"}"
```

**COPIER:** Status HTTP + Response Body complet

### Test Frontend

1. Ouvrir http://localhost:5173
2. Cliquer "Créer un compte"
3. Remplir formulaire:
   - Org: "Test Org MVP"
   - Email: "test-mvp@test.local"
   - Password: "Test123456!"
4. DevTools (F12) → Network tab
5. Soumettre formulaire
6. **Chercher requête "register" / "auth"**
7. Noter: URL, Status, Response entier

### Diagnostic Arbre

```
Test Direct (curl) Réussi?
├─ OUI → 200/201
│         └─ Frontend marche aussi?
│            ├─ OUI → PASS 2.1 ✅
│            └─ NON → Problème frontend/proxy
└─ NON → 404
         └─ Quarkus démarre sur le bon port?
            ├─ OUI → Problème routage/endpoint
            └─ NON → Port différent (ex: 8081)
```

### Résultats à Fournir

```
PHASE 2.1 RÉSULTATS
═════════════════════════

Quarkus Port: http://0.0.0.0:XXXX

Test 2.1.1 (curl login):
  Status: [HTTP/1.1 XXX]
  Body:
  [copier complet]

Test 2.1.2 (curl register):
  Status: [HTTP/1.1 XXX]
  Body:
  [copier complet]

Frontend Register Test:
  Request URL: [ex: http://localhost:5173/...]
  DevTools Status: [XXX]
  Response: [copier complet]

CONCLUSION:
[Blocker identifié ou PASS]
```

**Ne pas continuer aux phases suivantes tant que 2.1 n'est pas PASS.**

---

## PHASE 2.2 — TEST AUTHENTIFICATION [APRÈS 2.1 PASS]

- [ ] **TEST 2.2.1 — Register Réel**
  - Créer: email@test.local, password, org "MVP Test"
  - Vérifier PostgreSQL: User créé, password hashé (jamais en clair)
  - Vérifier: organizationId présent dans JWT
  - Status attendu: 201 ou 200 + JWT token

- [ ] **TEST 2.2.2 — Login Réel**
  - Login: email@test.local + password correct
  - Status: 200 + JWT
  - JWT contient: organizationId, userId, email
  
- [ ] **TEST 2.2.3 — Login Mauvais Credentials**
  - Login: email@test.local + mauvais password
  - Status: 401 (pas de détails sensibles)
  
- [ ] **TEST 2.2.4 — Login Utilisateur Inexistant**
  - Login: inexistant@test.local + password
  - Status: 401 (réponse sécurisée, no user enumeration)

- [ ] **TEST 2.2.5 — Accès /app sans JWT**
  - Frontend: Pas de JWT en localStorage
  - Accès http://localhost:5173/app
  - Résultat: Redirect /login

- [ ] **TEST 2.2.6 — Accès /app avec JWT valide**
  - Après login réussi
  - Accès http://localhost:5173/app
  - Résultat: Dashboard visible

---

## FINAL CHECKLIST

- [ ] Phase 2.1 Runtime 404 Resolved
- [ ] Phase 2.2-2.8 Core Features Validated
- [ ] Phase 2.9 Multi-Tenant Isolation Verified
- [ ] Phase 2.10-2.12 Security Tested
- [ ] Phase 2.13-2.15 UX & Responsiveness Checked
- [ ] Phase 2.16-2.18 Build & Cleanup Complete
- [ ] Phase 2.19 Final Report Generated

**MVP Status Options:**
- ✅ READY FOR PRODUCTION
- ⚠️ READY FOR STAGING  
- ❌ NEEDS FIXES
- ❌ NOT READY

---

## NEXT ACTION

**► Start PHASE 2.1 Runtime Testing Now**

User must:
1. Start 3 terminals (docker-compose, mvn quarkus:dev, npm run dev)
2. Execute curl tests from Terminal 4
3. Report results
4. I'll diagnose + iterate until PASS

Attente du runtime testing results pour Phase 2.1.
