# CYBERAS Intelligence — MVP Test Plan
**Date:** 2026-09-02  
**Version:** MVP-v1  
**Status:** Ready for Live Testing

---

## SETUP INSTRUCTIONS

### Terminal 1 — PostgreSQL + Redis + Kafka
```bash
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service
docker-compose up postgres redis kafka
```

**Wait for:**
- PostgreSQL: port 5432 ✓
- Redis: port 6379 ✓  
- Kafka: port 9092 ✓

### Terminal 2 — Backend Quarkus
```bash
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service
mvn quarkus:dev
```

**Wait for:**
```
Listening on: http://0.0.0.0:8080
```

### Terminal 3 — Frontend React
```bash
cd c:\Users\DELL PRECISION 5550\Projects\cyberas-audit-service\frontend
npm run dev
```

**Wait for:**
```
Local:   http://localhost:5173
```

### Monitor URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/q/swagger-ui/
- Kafka UI: http://localhost:8081
- Redis Commander: http://localhost:8082
- pgAdmin: http://localhost:5050

---

## TEST 1 — AUTHENTICATION

### 1.1 Register (Create Organization)

**URL:** http://localhost:5173/inscription

**Form:**
- Organization Name: `Cyberas Test Org`
- Email: `test@cyberas.local`
- Password: `Test@12345`
- Confirm Password: `Test@12345`

**Expected:**
- [ ] POST /api/auth/register succeeds
- [ ] HTTP 201 Created
- [ ] JWT returned in response
- [ ] organizationId present
- [ ] userId present
- [ ] Redirect to /app
- [ ] localStorage has `auth_user` with JWT

**Backend Verification (pgAdmin):**
- [ ] user row created in users table
- [ ] organization row created in organizations table
- [ ] relationship correct (user.organization_id = organization.id)

**Fail Criteria:**
- [ ] 400 Bad Request (validation)
- [ ] 409 Conflict (duplicate email)
- [ ] 500 Internal Server Error
- [ ] No redirect to /app
- [ ] No JWT in response

---

### 1.2 Login (Real Credentials)

**URL:** http://localhost:5173/login

**Form:**
- Email: `test@cyberas.local`
- Password: `Test@12345`

**Expected:**
- [ ] POST /api/auth/login succeeds
- [ ] HTTP 200 OK
- [ ] JWT returned
- [ ] organizationId present
- [ ] Redirect to /app
- [ ] localStorage updated with new JWT

**Fail Criteria:**
- [ ] 401 Unauthorized (wrong password)
- [ ] 404 Not Found (wrong email)
- [ ] No JWT returned

---

### 1.3 Login Failed (Wrong Password)

**Form:**
- Email: `test@cyberas.local`
- Password: `WrongPassword`

**Expected:**
- [ ] POST /api/auth/login fails
- [ ] HTTP 401 Unauthorized
- [ ] Error message displayed: "Erreur de connexion" or similar
- [ ] No redirect
- [ ] No JWT stored

---

### 1.4 Logout

**On /app dashboard:**
- [ ] Find logout button/link
- [ ] Click logout
- [ ] localStorage cleared (auth_user removed)
- [ ] Redirect to /
- [ ] Refresh page → shows /login (not authenticated)

---

### 1.5 Refresh Token (Session Persistence)

**After login:**
- [ ] F5 refresh on /app
- [ ] Page remains accessible
- [ ] Dashboard loads with data
- [ ] JWT still valid
- [ ] No re-login required

---

## TEST 2 — DASHBOARD

**URL:** http://localhost:5173/app

**Expected Display:**
- [ ] "Bonjour Cyberas Test Org" greeting
- [ ] KPI cards showing:
  - [ ] Audits: 0 (no audits yet)
  - [ ] Scans: 0
  - [ ] Findings: 0
  - [ ] Completed Scans: 0
  - [ ] Critical: 0
- [ ] "Audits (0)" section
- [ ] "Recent Activity" section (empty or system info)

**Data Verification:**
- [ ] Browser DevTools → Network tab
- [ ] GET /api/audits → 200 OK
- [ ] GET /api/scans → 200 OK or [] (empty)
- [ ] GET /api/findings → 200 OK or [] (empty)
- [ ] Response headers include Authorization: Bearer {JWT}

**Fail Criteria:**
- [ ] API calls return 401 (JWT invalid)
- [ ] API calls return 403 (permission denied)
- [ ] Dashboard shows mock data instead of real data
- [ ] KPI numbers don't match API response

---

## TEST 3 — CREATE AUDIT

**URL:** http://localhost:5173/app/audits

**Form (if modal/page exists):**
- [ ] Audit Code: `AUDIT-001`
- [ ] Title: `Test Audit`
- [ ] Description: `Testing the MVP`
- [ ] Status: PLANNED or similar

**Click "Create" / "Créer":**

**Expected:**
- [ ] POST /api/audits succeeds
- [ ] HTTP 201 Created
- [ ] auditId returned
- [ ] Audit appears in list immediately
- [ ] timestamp shows "now"
- [ ] creator shows logged-in user email

**Database Verification (pgAdmin):**
- [ ] Row in audits table
- [ ] organization_id = test org
- [ ] created_by_id = test user
- [ ] status = PLANNED
- [ ] created_at = recent timestamp

**Fail Criteria:**
- [ ] 400 Bad Request (validation)
- [ ] 409 Conflict (duplicate code)
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] Audit not in list after creation
- [ ] Wrong organization_id in DB

---

## TEST 4 — CREATE ASSET

**URL:** http://localhost:5173/app/assets

**Form:**
- [ ] Hostname: `server.test.local`
- [ ] IP Address: `192.168.1.100`
- [ ] Asset Type: `SERVER`
- [ ] Environment: `PRODUCTION`
- [ ] Criticality: `HIGH`

**Click Create:**

**Expected:**
- [ ] POST /api/assets succeeds
- [ ] HTTP 201 Created
- [ ] Asset in list immediately
- [ ] Criticality shows badge (HIGH = orange)
- [ ] Audit association correct

**Database:**
- [ ] Row in assets table
- [ ] organization_id = test org
- [ ] audit_id = TEST AUDIT-001
- [ ] hostname = server.test.local
- [ ] ip_address = 192.168.1.100

**Fail Criteria:**
- [ ] Asset not created
- [ ] Wrong organization in DB
- [ ] Wrong audit association

---

## TEST 5 — VIEW FINDINGS

**URL:** http://localhost:5173/app/findings

**Expected:**
- [ ] GET /api/findings succeeds
- [ ] HTTP 200 OK
- [ ] findings = [] (empty if none created)
- [ ] Table headers show:
  - [ ] Title
  - [ ] Severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
  - [ ] Source
  - [ ] Status

**If findings exist:**
- [ ] Severity badges color-coded:
  - [ ] CRITICAL = red
  - [ ] HIGH = orange
  - [ ] MEDIUM = yellow
  - [ ] LOW = blue
  - [ ] INFO = gray

**Fail Criteria:**
- [ ] API not called
- [ ] Data hardcoded/mocked
- [ ] 401 or 403 errors

---

## TEST 6 — RISK MAP

**URL:** http://localhost:5173/app/risk-map

**Expected:**
- [ ] GET /api/risks succeeds
- [ ] KPI cards show:
  - [ ] Critiques: 0 (no risks yet)
  - [ ] Risques élevés: 0
  - [ ] Risques moyens: 0
  - [ ] Score moyen: 0 or N/A
- [ ] Table shows headers:
  - [ ] Titre
  - [ ] Probabilité
  - [ ] Impact
  - [ ] Score
  - [ ] Sévérité (badge)
  - [ ] Responsable
  - [ ] Statut

**Important:** 
- [ ] **Risk Score is NOT calculated by React**
- [ ] Score comes from backend Risk Engine
- [ ] No formulas or calculations in frontend JS

**Fail Criteria:**
- [ ] Score calculated frontend-side
- [ ] Mock risk data shown
- [ ] Severity calculated from probability × impact in React

---

## TEST 7 — AUDIT TRAIL

**URL:** http://localhost:5173/app/audit-trail

**Expected after above tests:**
- [ ] GET /api/audit-trail succeeds
- [ ] Events show:
  - [ ] LOGIN (your login)
  - [ ] AUDIT_CREATED (your created audit)
  - [ ] ASSET_CREATED (your created asset)

**Each event shows:**
- [ ] Actor: `test@cyberas.local`
- [ ] Action: `AUDIT_CREATED`, `ASSET_CREATED`
- [ ] Timestamp: recent time
- [ ] IP Address: 127.0.0.1 or ::1 (localhost)
- [ ] User-Agent: Mozilla/5.0 (your browser string)
- [ ] Resource: AUDIT or ASSET

**Database (pgAdmin):**
- [ ] Rows in audit_events table
- [ ] event_type matches actions
- [ ] ip_address captured
- [ ] user_agent captured
- [ ] timestamp accurate

**Fail Criteria:**
- [ ] No events recorded
- [ ] Events from other organizations visible
- [ ] IP address missing or wrong
- [ ] User-Agent missing

---

## TEST 8 — MULTI-TENANT ISOLATION

### 8.1 Create Second Organization

**URL:** http://localhost:5173/logout

Then http://localhost:5173/inscription

**Form:**
- Organization Name: `Competitor Org`
- Email: `competitor@test.local`
- Password: `Competitor@123`

**Result:**
- [ ] Login with Competitor account
- [ ] Redirect to /app
- [ ] Dashboard shows "Bonjour Competitor Org"
- [ ] organizationId different from first org

### 8.2 Attempt Cross-Org Access (Competitor accesses First Org's Audit)

**Note:** Competitor has no audits. First org's Audit ID: `{AUDIT-001-ID}`

**Manual test via DevTools Console:**
```javascript
fetch('/api/audits/{AUDIT-001-ID}', {
  headers: {'Authorization': 'Bearer {COMPETITOR-JWT}'}
})
.then(r => r.json())
.then(d => console.log(d))
```

**Expected:**
- [ ] HTTP 403 Forbidden OR 404 Not Found
- [ ] No audit data returned
- [ ] Error message: "Forbidden" or "Not Found"

**Fail Criteria:**
- [ ] HTTP 200 with audit data
- [ ] Audit from first org visible to competitor

### 8.3 Assets Cross-Org Check

**Competitor tries accessing First Org's Asset via ID:**
```javascript
fetch('/api/assets/{ASSET-ID}', {
  headers: {'Authorization': 'Bearer {COMPETITOR-JWT}'}
})
```

**Expected:**
- [ ] HTTP 403 or 404
- [ ] No asset data

---

## TEST 9 — CORS VALIDATION

### 9.1 Request from Allowed Origin (localhost:5173)

**Backend Swagger (http://localhost:8080/q/swagger-ui/):**
- [ ] Click "Try it out" on any GET endpoint (e.g., /audits)
- [ ] Request succeeds
- [ ] Response headers include:
  - [ ] `Access-Control-Allow-Origin: http://localhost:5173`
  - [ ] `Access-Control-Allow-Credentials: true`
  - [ ] `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`

### 9.2 Request from Disallowed Origin

**Browser console:**
```javascript
fetch('http://localhost:8080/api/audits', {
  headers: {'Authorization': 'Bearer {JWT}'}
})
// from origin http://malicious.com (simulated)
```

**Expected:**
- [ ] Request sent but browser blocks response (no CORS headers)
- [ ] Console shows CORS error: "No 'Access-Control-Allow-Origin' header"

---

## TEST 10 — RATE LIMITING (429)

### 10.1 Login Rate Limit

**Test max 5 login attempts per 15 minutes:**

**Make 5 requests:**
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.local","password":"test"}'
done
```

**Results:**
- [ ] First 5: HTTP 401 (wrong password, but processed)
- [ ] 6th attempt: HTTP 429 Too Many Requests

**Response body:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later."
}
```

**Response headers:**
- [ ] `Retry-After: 60` or similar

### 10.2 Frontend Handling of 429

**When rate limit hit:**
- [ ] Error message shown (not generic 500)
- [ ] NOT redirected to login
- [ ] User can retry after Retry-After timeout
- [ ] Toast or notification: "Trop de requêtes" (Too many requests)

---

## TEST 11 — ERROR HANDLING

### 11.1 HTTP 400 (Bad Request)

**Create Asset with invalid data:**
```bash
curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT}" \
  -d '{"hostname":"","environment":"INVALID"}'
```

**Expected:**
- [ ] HTTP 400 Bad Request
- [ ] Error details in response body
- [ ] Frontend shows validation error

### 11.2 HTTP 403 (Forbidden)

**Covered in Multi-Tenant test (cross-org access)**

**Expected:** HTTP 403

### 11.3 HTTP 404 (Not Found)

**Request non-existent audit:**
```bash
curl http://localhost:8080/api/audits/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer {JWT}"
```

**Expected:**
- [ ] HTTP 404 Not Found
- [ ] Error message: "Not Found" or "Audit not found"

### 11.4 HTTP 500 (Backend Error)

**Intentionally trigger backend error (if possible):**
- Corrupt a JWT token and send it
- OR send malformed JSON

**Expected:**
- [ ] HTTP 500 Internal Server Error
- [ ] Error message generic (no stack trace)
- [ ] Backend logs error details (check Terminal 2)

### 11.5 Network Error (Backend Down)

**Stop Quarkus (Ctrl+C in Terminal 2)**

**Try to load /app:**
- [ ] Frontend shows "Erreur de chargement" or similar
- [ ] Retry button available
- [ ] No infinite loop or hang

---

## TEST 12 — RESPONSIVE DESIGN

Test at these viewport sizes. Use browser DevTools (Ctrl+Shift+M):

### 12.1 Mobile (390×844)

**Test on /app/audits:**
- [ ] Content readable (no horizontal scroll)
- [ ] Table scrolls horizontally if needed (not full page)
- [ ] Buttons clickable
- [ ] Text not cut off
- [ ] Navigation accessible

### 12.2 Small Phone (430×932)

**Same checks as 12.1**

### 12.3 Tablet (1280×800)

**Test /app/risk-map:**
- [ ] Grid layout 2-3 columns
- [ ] Table readable
- [ ] KPI cards arranged nicely

### 12.4 Desktop (1440×900)

**Test full app:**
- [ ] 4-5 column layouts
- [ ] Sidebar (if present) visible
- [ ] All features accessible

### 12.5 Large Desktop (1920×1080)

**Test max width constraints:**
- [ ] Content doesn't stretch too wide
- [ ] max-width: effective
- [ ] Spacing proportional

---

## TEST RESULTS SUMMARY TABLE

| Feature | Status | Notes |
|---------|--------|-------|
| **AUTH** | | |
| Register | PASS / FAIL | |
| Login | PASS / FAIL | |
| Login Failed | PASS / FAIL | |
| Logout | PASS / FAIL | |
| Session Persistence | PASS / FAIL | |
| **DASHBOARD** | PASS / FAIL | |
| **AUDITS** | PASS / FAIL | |
| **ASSETS** | PASS / FAIL | |
| **FINDINGS** | PASS / FAIL | |
| **RISK MAP** | PASS / FAIL | |
| **AUDIT TRAIL** | PASS / FAIL | |
| **MULTI-TENANT** | PASS / FAIL | |
| Cross-Org Audit | PASS / FAIL | |
| Cross-Org Asset | PASS / FAIL | |
| **CORS** | PASS / FAIL | |
| Allowed Origin | PASS / FAIL | |
| Blocked Origin | PASS / FAIL | |
| **RATE LIMIT** | PASS / FAIL | |
| Login Rate Limit | PASS / FAIL | |
| 429 Handling | PASS / FAIL | |
| **ERROR HANDLING** | | |
| 400 Bad Request | PASS / FAIL | |
| 403 Forbidden | PASS / FAIL | |
| 404 Not Found | PASS / FAIL | |
| 500 Server Error | PASS / FAIL | |
| Network Error | PASS / FAIL | |
| **RESPONSIVE** | | |
| Mobile (390px) | PASS / FAIL | |
| Small Phone (430px) | PASS / FAIL | |
| Tablet (1280px) | PASS / FAIL | |
| Desktop (1440px) | PASS / FAIL | |
| Large (1920px) | PASS / FAIL | |

---

## FINAL MVP STATUS

### Overall Result:

**[ ] READY FOR PRODUCTION**  
**[ ] READY FOR STAGING**  
**[ ] NEEDS FIXES (List below)**  
**[ ] NOT READY**

### Blockers (if any):

1. Issue: ___
   - Endpoint: ___
   - HTTP Status: ___
   - Error: ___
   - Fix: ___

2. Issue: ___
   - Endpoint: ___
   - HTTP Status: ___
   - Error: ___
   - Fix: ___

### Notes:

___

---

## NEXT STEPS

If **READY**: Deploy to Render (backend) + Vercel (frontend)

If **NEEDS FIXES**: 
1. Document each issue above
2. Fix in code
3. Re-test specific failing tests
4. Re-run full suite if major changes

If **NOT READY**: Review blockers, redesign approach if needed

---

**Generated:** 2026-09-02  
**By:** Claude Code MVP Test Framework  
**Status:** Ready for execution
