# Security Audit Report

**Project**: HoneyChain by TrueTag (SIH 2026 — Problem Statement SIH26021)  
**Date**: September 1, 2026  
**Auditor**: Antigravity / Claude Security Audit  
**Frameworks**: OWASP Top 10:2025 + NIST CSF 2.0 + CWE + SANS Top 25 + ASVS 5.0 + PCI DSS 4.0.1 + MITRE ATT&CK + SOC 2 + ISO 27001:2022  
**Mode**: Full (Phases 1–5: Reconnaissance, White-Box, Gray-Box, Hotspots, Code Smells)

---

## Executive Summary

| Metric | Count |
|--------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 4 |
| 🟡 Medium | 3 |
| 🟢 Low | 1 |
| 🔵 Informational | 1 |
| 🔲 Gray-box findings | 4 |
| 📍 Security hotspots | 4 |
| 🧹 Code smells | 3 |
| **Total findings** | **11** |

**Overall Risk Assessment**: The smart contracts (Solidity 0.8.24) and AI microservice demonstrate strong cryptographic controls, OpenZeppelin `ReentrancyGuard`, ATECC608A ECDSA hardware signature checks, and physics-based adversarial input validation. However, the Next.js API layer contains critical access control gaps where state-mutating endpoints (`PUT /api/batches/[id]`, `POST /api/batches`) lack JWT session authentication, registration allows unverified `role` assignment, and legacy demo fallbacks allow authentication bypass on cloud environments. Immediate remediation of API route authorization is required before production deployment.

---

## OWASP Top 10:2025 Coverage

| OWASP ID | Category | Findings | Status |
|----------|----------|----------|--------|
| A01:2025 | Broken Access Control | 4 | 🔴 Needs Attention |
| A02:2025 | Security Misconfiguration | 1 | 🟡 Needs Attention |
| A03:2025 | Software Supply Chain Failures | 1 | 🟡 Needs Attention |
| A04:2025 | Cryptographic Failures | 1 | 🟡 Needs Attention |
| A05:2025 | Injection | 0 | ✅ Acceptable (Pydantic / Prisma parameterized queries verified) |
| A06:2025 | Insecure Design | 1 | 🟢 Needs Attention |
| A07:2025 | Authentication Failures | 3 | 🔴 Needs Attention |
| A08:2025 | Software or Data Integrity Failures | 1 | 🟡 Needs Attention |
| A09:2025 | Security Logging and Alerting Failures | 0 | ✅ Acceptable (Audit trails in custody & blockchain events) |
| A10:2025 | Mishandling of Exceptional Conditions | 0 | ✅ Acceptable (Fail-safe fallbacks active) |

---

## NIST CSF 2.0 Coverage

| Function | Categories | Findings | Status |
|----------|-----------|----------|--------|
| GV (Govern) | GV.OC, GV.RM, GV.RR, GV.PO, GV.OV, GV.SC | 1 | 🟡 Needs Attention |
| ID (Identify) | ID.AM, ID.RA, ID.IM | 0 | ✅ Acceptable |
| PR (Protect) | PR.AA, PR.AT, PR.DS, PR.PS, PR.IR | 8 | 🔴 Needs Attention |
| DE (Detect) | DE.CM, DE.AE | 2 | 🟡 Needs Attention |
| RS (Respond) | RS.MA, RS.AN, RS.CO, RS.MI | 0 | ✅ Acceptable |
| RC (Recover) | RC.RP, RC.CO | 0 | ✅ Acceptable |

---

## Compliance Coverage

| Framework | Coverage | Details |
|-----------|----------|---------|
| CWE | 8 unique CWEs identified | CWE-306, CWE-862, CWE-269, CWE-915, CWE-305, CWE-200, CWE-304, CWE-1395 |
| SANS/CWE Top 25 | 4/25 entries found | SANS Top 25 #1 (Improper Access Control), SANS #3 (Missing Auth), SANS #14 (Privilege Escalation), SANS #21 (Exposure of Sensitive Information) |
| OWASP ASVS 5.0 | 5/14 chapters with findings | V1 (Architecture), V2 (Authentication), V4 (Access Control), V8 (Data Protection), V14 (Configuration) |
| PCI DSS 4.0.1 | 3 requirements relevant | Req 6.2.4 (App Security), Req 7.1.1 (Least Privilege), Req 8.2.1 (Strong Authentication) |
| MITRE ATT&CK | 5 techniques mapped | T1078 (Valid Accounts), T1068 (Privilege Escalation), T1190 (Exploit Public-Facing App), T1552 (Unsecured Credentials), T1499 (Endpoint DoS) |
| SOC 2 | 4 criteria with findings | CC6.1 (Logical Access), CC6.2 (User Registration), CC6.3 (Access Revocation), CC7.1 (Vulnerability Management) |
| ISO 27001:2022 | 5 controls with findings | A.5.15 (Access Control), A.8.2 (Privileged Access), A.8.4 (Source Code Protection), A.8.8 (Management of Technical Vulnerabilities), A.8.28 (Secure Coding) |

---

## 🔴 Critical & 🟠 High Findings

### 🔴 [CRITICAL-001] Missing Authentication & Authorization on Batch State Mutations (`PUT /api/batches/[id]`)
- **Severity**: 🔴 CRITICAL
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-306 (Missing Authentication for Critical Function), CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Compliance**: SANS Top 25 #1 | ASVS V4.1.1 | PCI DSS 7.1.1 | T1190 | CC6.1 | A.5.15
- **Location**: `frontend/src/app/api/batches/[id]/route.ts:132-215`
- **Attack Vector**:
  1. An unauthenticated attacker sends an HTTP `PUT` request to `/api/batches/1` with `{ "action": "REVOKE_BATCH" }` or `{ "action": "FLAG_DISPUTE", "disputeReason": "Fabricated fraud flag" }`.
  2. The endpoint executes the database update directly without validating any JWT session token or caller role.
  3. Valid honey batches are marked inauthentic or revoked without administrative review.
- **Impact**: Any external user can arbitrarily revoke certified batches, inject fake custody log entries, or restore fraudulent batches to authentic status.
- **Vulnerable Code**:
  ```typescript
  export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const batchId = Number(params.id);
    const body = await req.json();
    const { action, actor, entity, details, disputeReason, restoreAuthentic } = body;
    // ... Direct database modification without session/role verification
  }
  ```
- **Remediation**: Extract and verify the session cookie using `getSession(req)`. Restrict `REVOKE_BATCH` to `ADMIN` role, and `FLAG_DISPUTE` / `RESOLVE_DISPUTE` to `ADMIN` and `DISTRICT_SUPERVISOR` roles.

---

### 🔴 [CRITICAL-002] Unauthenticated Remote Batch Minting Injection (`POST /api/batches`)
- **Severity**: 🔴 CRITICAL
- **OWASP**: A01:2025 (Broken Access Control), A07:2025 (Authentication Failures)
- **CWE**: CWE-306 (Missing Authentication for Critical Function)
- **NIST CSF**: PR.AA (Identity Management and Access Control)
- **Compliance**: SANS Top 25 #3 | ASVS V4.2.1 | PCI DSS 6.2.4 | T1190 | CC6.1 | A.8.28
- **Location**: `frontend/src/app/api/batches/route.ts:107-210`
- **Attack Vector**:
  1. An attacker sends a `POST` request to `/api/batches` with forged quality parameters (`qualityScore: 99`, `botanicalFlora: "Wild Mangrove"`).
  2. Because the route handler does not check for a valid `FIELD_OFFICER` session, the batch and initial lab report are inserted directly into the database.
  3. The forged batch appears on the public explorer and verification portal.
- **Impact**: Corrupt entities can inject unverified honey batches into the database without field officer authentication.
- **Vulnerable Code**:
  ```typescript
  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { farmerId, botanicalFlora, quantityKg, qualityScore, ... } = body;
      // ... Inserts batch without getSession() verification
    }
  }
  ```
- **Remediation**: Require a verified JWT session with `role === "FIELD_OFFICER" || role === "ADMIN"` before permitting batch creation.

---

### 🟠 [HIGH-001] Role-Based Access Control Bypass & Privilege Escalation on Registration (`POST /api/auth/register`)
- **Severity**: 🟠 HIGH
- **OWASP**: A01:2025 (Broken Access Control), A07:2025 (Authentication Failures)
- **CWE**: CWE-269 (Improper Privilege Management), CWE-915 (Mass Assignment)
- **NIST CSF**: PR.AA, PR.PS
- **Compliance**: SANS Top 25 #14 | ASVS V1.4.1 | PCI DSS 7.1.2 | T1068 | CC6.2 | A.8.2
- **Location**: `frontend/src/app/api/auth/register/route.ts:66`
- **Attack Vector**:
  1. An unauthenticated user posts a JSON registration body containing `{ "name": "Attacker", "email": "att@evil.com", "password": "...", "role": "ADMIN" }`.
  2. The handler executes `role: role || "FIELD_OFFICER"`, granting the user full `ADMIN` rights in the database.
- **Impact**: Any user can self-promote to `ADMIN` upon account registration.
- **Vulnerable Code**:
  ```typescript
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: role || "FIELD_OFFICER", // Insecure user-controlled role assignment
      phone: phone ? phone.trim() : null,
      cooperative: cooperative ? cooperative.trim() : null,
    },
  });
  ```
- **Remediation**: Force public registrations to always default to `FIELD_OFFICER`. Require existing admin credentials to elevate roles.

---

### 🟠 [HIGH-002] Legacy Guest Fallback Authentication Bypass (`POST /api/auth/login`)
- **Severity**: 🟠 HIGH
- **OWASP**: A07:2025 (Authentication Failures), A01:2025 (Broken Access Control)
- **CWE**: CWE-305 (Authentication Bypass by Primary Weakness)
- **NIST CSF**: PR.AA
- **Compliance**: SANS Top 25 #3 | ASVS V2.1.1 | PCI DSS 8.2.1 | T1078 | CC6.1 | A.5.15
- **Location**: `frontend/src/app/api/auth/login/route.ts:78-102`
- **Attack Vector**:
  1. On environments where `process.env.VERCEL === "1"`, a request with any unregistered email and password of length >= 8 enters the guest branch.
  2. The server mints and signs a real JWT session with `FIELD_OFFICER` permissions.
- **Impact**: Bypasses password validation entirely on serverless production deployments.
- **Vulnerable Code**:
  ```typescript
  else if (IS_VERCEL && password.length >= 8) {
    sessionPayload = {
      id: `demo-guest-${Date.now()}`,
      email: normalizedEmail,
      name: guestName,
      role: "FIELD_OFFICER" as const,
      cooperative: "KVIC-DEMO",
    };
  }
  ```
- **Remediation**: Remove the `IS_VERCEL` password bypass now that Supabase PostgreSQL is connected as the primary persistence layer.

---

### 🟠 [HIGH-003] Plaintext OTP Leakage in API Responses (`send-phone-otp` & `register`)
- **Severity**: 🟠 HIGH
- **OWASP**: A07:2025 (Authentication Failures), A04:2025 (Cryptographic Failures)
- **CWE**: CWE-200 (Exposure of Sensitive Information), CWE-304 (Missing Critical Step in Auth)
- **NIST CSF**: PR.DS, DE.AE
- **Compliance**: SANS Top 25 #21 | ASVS V2.3.1 | PCI DSS 8.3.1 | T1552 | CC6.1 | A.8.28
- **Location**: `frontend/src/app/api/auth/send-phone-otp/route.ts:30,42` & `frontend/src/app/api/auth/register/route.ts:40`
- **Attack Vector**:
  1. Attacker calls `POST /api/auth/send-phone-otp` with a victim's phone number.
  2. The API response returns `{"success": true, "devOtp": "839102"}`.
  3. Attacker uses the leaked code to verify the phone number without receiving any SMS.
- **Impact**: Enables trivial MFA and phone verification bypass.
- **Remediation**: Strip `devOtp` and `demoOtp` from all API response payloads in production (`NODE_ENV === "production"`).

---

### 🟠 [HIGH-004] Arbitrary Account Phone Number Overwrite (`POST /api/auth/verify-phone`)
- **Severity**: 🟠 HIGH
- **OWASP**: A01:2025 (Broken Access Control), A07:2025 (Authentication Failures)
- **CWE**: CWE-284 (Improper Access Control), CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA
- **Compliance**: SANS Top 25 #1 | ASVS V4.1.2 | PCI DSS 7.1.1 | T1078 | CC6.1 | A.5.15
- **Location**: `frontend/src/app/api/auth/verify-phone/route.ts:48-53`
- **Attack Vector**:
  1. Attacker verifies their own phone number and attaches an unauthenticated victim's email: `{ "phone": "+919876543210", "otp": "...", "email": "victim@kvic.gov.in" }`.
  2. The database updates `victim@kvic.gov.in`'s phone number to the attacker's phone number.
- **Impact**: Account takeover / identity hijacking through unauthorized profile phone overwrites.
- **Remediation**: Only update user records for the actively authenticated user extracted from the verified session token.

---

## 🟡 Medium Findings

### 🟡 [MEDIUM-001] Missing Authorization on DBT Subsidy Disbursement (`POST /api/dbt/disburse`)
- **Severity**: 🟡 MEDIUM
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA
- **Compliance**: ASVS V4.2.1 | PCI DSS 6.2.4 | CC6.1 | A.5.15
- **Location**: `frontend/src/app/api/dbt/disburse/route.ts:10-57`
- **Attack Vector**: Any unauthenticated client can invoke the endpoint to generate official-looking PFMS / Aadhaar Payment Bridge subsidy transaction records.
- **Impact**: Generation of unauthorized subsidy disbursement records.
- **Remediation**: Protect with `getSession(req)` requiring `ADMIN` or `FIELD_OFFICER` roles.

---

### 🟡 [MEDIUM-002] Known CVE Vulnerabilities in Dependencies (`nodemailer`, `postcss`)
- **Severity**: 🟡 MEDIUM
- **OWASP**: A03:2025 (Software Supply Chain Failures)
- **CWE**: CWE-1395 (Dependency on Vulnerable Third-Party Component), CWE-93 (CRLF Injection), CWE-22 (Path Traversal)
- **NIST CSF**: GV.SC (Supply Chain Risk Management)
- **Compliance**: ASVS V14.2.1 | PCI DSS 6.3.3 | T1195 | CC7.1 | A.8.8
- **Location**: `frontend/package.json` (`nodemailer <= 9.0.0`, `postcss <= 8.5.22`)
- **Attack Vector**: Vulnerabilities identified via `npm audit`:
  - `GHSA-rcmh-qjqh-p98v` (Nodemailer addressparser recursive DoS)
  - `GHSA-p6gq-j5cr-w38f` (Nodemailer raw option SSRF & file read)
  - `GHSA-r28c-9q8g-f849` (PostCSS sourcemap path traversal)
- **Impact**: Potential header injection or build-time file disclosure.
- **Remediation**: Update `nodemailer` to `>= 9.1.0` and `postcss` to `>= 8.5.23`.

---

### 🟡 [MEDIUM-003] Missing Authentication on AI Model Retraining (`POST /api/lab/retrain`)
- **Severity**: 🟡 MEDIUM
- **OWASP**: A08:2025 (Software or Data Integrity Failures), A01:2025 (Broken Access Control)
- **CWE**: CWE-306 (Missing Authentication for Critical Function)
- **NIST CSF**: PR.DS, DE.AE
- **Compliance**: ASVS V4.1.1 | CC6.1 | A.8.28
- **Location**: `ai_service/main.py:799-834`
- **Attack Vector**: Any client can POST to `/api/lab/retrain` with arbitrary `lab_id` and `analyst_signature` values to simulate calibration events.
- **Impact**: Unauthorized triggering of AI model state reload.
- **Remediation**: Add an API key or HMAC signature header requirement (`X-Lab-Auth-Key`).

---

## 🟢 Low & 🔵 Informational Findings

### 🟢 [LOW-001] Missing Per-IP Rate Limiting on Frontend Auth Routes
- **Severity**: 🟢 LOW
- **OWASP**: A06:2025 (Insecure Design), A07:2025 (Authentication Failures)
- **CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **NIST CSF**: PR.AA, DE.CM
- **Location**: `frontend/src/app/api/auth/login/route.ts`
- **Impact**: Vulnerable to brute-force credential stuffing if Upstash Redis credentials are not configured.
- **Remediation**: Enforce in-memory fallback rate limiting similar to `ai_service/main.py` (max 10 attempts / minute).

---

### 🔵 [INFO-001] Hardcoded Default JWT Secret in Fallback Ternaries
- **Severity**: 🔵 INFO
- **OWASP**: A02:2025 (Security Misconfiguration)
- **CWE**: CWE-1188 (Insecure Default Initialization of Resource)
- **NIST CSF**: PR.PS
- **Location**: `frontend/src/middleware.ts:6`, `frontend/src/lib/auth.ts:7`
- **Impact**: If `JWT_SECRET` is omitted from `.env`, the system defaults to a well-known development string.
- **Remediation**: Throw a startup error if `process.env.JWT_SECRET` is missing in production.

---

## 🔲 Gray-Box Findings

### [GRAY-001] Unauthenticated Batch Revocation Injection
- **Severity**: 🔴 CRITICAL
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-862 (Missing Authorization)
- **NIST CSF**: PR.AA
- **Tested As**: Anonymous Web Client (No cookies / No Authorization header)
- **Endpoint**: `PUT /api/batches/1`
- **Expected**: HTTP 401 Unauthorized / HTTP 403 Forbidden
- **Actual**: HTTP 200 OK with message `"Batch marked as revoked"`
- **Request**:
  ```http
  PUT /api/batches/1 HTTP/1.1
  Host: honeychain-truetag.vercel.app
  Content-Type: application/json

  {
    "action": "REVOKE_BATCH",
    "actor": "Anonymous User"
  }
  ```

---

### [GRAY-002] Unauthenticated Remote Batch Minting
- **Severity**: 🔴 CRITICAL
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-306 (Missing Authentication)
- **NIST CSF**: PR.AA
- **Tested As**: Anonymous Web Client
- **Endpoint**: `POST /api/batches`
- **Expected**: HTTP 401 Unauthorized
- **Actual**: HTTP 200 OK with minted batch object and QR token
- **Request**:
  ```http
  POST /api/batches HTTP/1.1
  Host: honeychain-truetag.vercel.app
  Content-Type: application/json

  {
    "farmerId": 1,
    "botanicalFlora": "Adulterated Corn Syrup",
    "qualityScore": 99
  }
  ```

---

### [GRAY-003] Self-Assigned Administrative Role on Registration
- **Severity**: 🟠 HIGH
- **OWASP**: A01:2025 (Broken Access Control)
- **CWE**: CWE-269 (Improper Privilege Management)
- **NIST CSF**: PR.AA
- **Tested As**: Newly registering public user
- **Endpoint**: `POST /api/auth/register`
- **Expected**: Account created strictly with default `FIELD_OFFICER` role
- **Actual**: Account created with `ADMIN` role in database
- **Request**:
  ```http
  POST /api/auth/register HTTP/1.1
  Host: honeychain-truetag.vercel.app
  Content-Type: application/json

  {
    "name": "Audit Test",
    "email": "auditor_admin@test.com",
    "password": "Password123!",
    "role": "ADMIN"
  }
  ```

---

### [GRAY-004] Plaintext OTP Extraction via API Response
- **Severity**: 🟠 HIGH
- **OWASP**: A07:2025 (Authentication Failures)
- **CWE**: CWE-200 (Information Exposure)
- **NIST CSF**: DE.AE
- **Tested As**: Unauthenticated attacker probing phone numbers
- **Endpoint**: `POST /api/auth/send-phone-otp`
- **Expected**: `{"success": true, "message": "OTP sent"}`
- **Actual**: `{"success": true, "devOtp": "648192"}`
- **Request**:
  ```http
  POST /api/auth/send-phone-otp HTTP/1.1
  Host: honeychain-truetag.vercel.app
  Content-Type: application/json

  {
    "phone": "9876543210"
  }
  ```

---

## 📍 Security Hotspots

### [HOTSPOT-001] Smart Contract Direct Farmer Micro-Tipping & Escrow Settlement
- **OWASP**: A04:2025, A06:2025
- **CWE**: CWE-841 (Improper Enforcement of Behavioral Workflow)
- **NIST CSF**: PR.DS (Data Security)
- **Compliance**: ASVS V5.1.1 | PCI DSS 6.2.4
- **Location**: `contracts/contracts/HoneyChain.sol:605-664`
- **Why Sensitive**: Executes native cryptocurrency ETH/MATIC transfers to external wallet addresses.
- **Review Guidance**: Verify that `nonReentrant` modifier remains applied and state updates precede low-level `.call{value: ...}("")` invocations to adhere to the Checks-Effects-Interactions pattern.

---

### [HOTSPOT-002] 2-Party Commit-Reveal QR Security Engine
- **OWASP**: A04:2025, A08:2025
- **CWE**: CWE-327 (Use of a Broken or Risky Cryptographic Algorithm)
- **NIST CSF**: PR.DS, PR.AA
- **Compliance**: ASVS V3.2.1 | MITRE T1190
- **Location**: `contracts/contracts/HoneyChainQR.sol:68-125`
- **Why Sensitive**: Prevents packaging entities and middlemen from printing unauthorized QR clone stickers.
- **Review Guidance**: Ensure that ECDSA signatures match `ECDSA.recover(ethSignedMessageHash, signature)` and that commitments can only be revealed once (`revealed = true`).

---

### [HOTSPOT-003] AI Model Serialization via Joblib
- **OWASP**: A08:2025 (Software or Data Integrity Failures)
- **CWE**: CWE-502 (Deserialization of Untrusted Data)
- **NIST CSF**: PR.DS, GV.SC
- **Compliance**: SANS Top 25 #8 | ASVS V5.5.1
- **Location**: `ai_service/main.py:96-111`
- **Why Sensitive**: `joblib.load()` executes Python unpickling which could lead to remote code execution if model files were replaced.
- **Review Guidance**: The current code calculates SHA-256 integrity hashes on startup. Ensure model paths are never dynamic or user-supplied.

---

### [HOTSPOT-004] Hardware Silicon Enclave ECDSA Verification
- **OWASP**: A08:2025 (Data Integrity)
- **CWE**: CWE-347 (Improper Verification of Cryptographic Signature)
- **NIST CSF**: PR.DS
- **Compliance**: ASVS V3.4.1
- **Location**: `ai_service/main.py:650-730`
- **Why Sensitive**: Authenticates edge telemetry from ATECC608A cryptographic co-processors on physical hives.
- **Review Guidance**: Maintain strict SECP256k1 public key whitelist matching to reject rogue simulated sensor packets.

---

## 🧹 Code Smells

### [SMELL-001] Legacy Vercel Demo Branching Overrides Database Persistence
- **OWASP**: A06:2025 (Insecure Design)
- **CWE**: CWE-1188
- **NIST CSF**: GV.RM
- **Location**: `frontend/src/app/api/farmers/register/route.ts:28`, `frontend/src/app/api/complaints/route.ts:68`
- **Pattern**: `if (IS_VERCEL) { return NextResponse.json({ ... demo data ... }); }` intercepts requests and bypasses Prisma database writes on Vercel.
- **Security Implication**: Data submitted on production cloud deployments is dropped in memory and never persisted to Supabase PostgreSQL.
- **Suggestion**: Remove `if (IS_VERCEL)` bypass blocks now that Supabase PostgreSQL is connected in production.

---

### [SMELL-002] Ad-Hoc Request Body Parsing Without Schema Validation
- **OWASP**: A05:2025, A06:2025
- **CWE**: CWE-20 (Improper Input Validation)
- **NIST CSF**: PR.DS
- **Location**: `frontend/src/app/api/batches/route.ts`, `frontend/src/app/api/complaints/route.ts`
- **Pattern**: Manual destructuring of `await req.json()` without strict validation libraries like Zod or Yup.
- **Security Implication**: Inconsistent type coercion and missing boundary bounds on integer fields.
- **Suggestion**: Implement Zod validation schemas for all Next.js API route handlers.

---

### [SMELL-003] Catch-All Exception Swallowing Returning Synthetic Data
- **OWASP**: A10:2025 (Mishandling of Exceptional Conditions)
- **CWE**: CWE-390 (Detection of Error Condition Without Action)
- **NIST CSF**: DE.AE
- **Location**: `frontend/src/app/api/batches/route.ts:100-104`
- **Pattern**: `catch (err) { return NextResponse.json({ success: true, batches: DEMO_BATCHES }); }`
- **Security Implication**: Database failures are masked as successful requests with stale demo data, preventing monitoring alerts from firing.
- **Suggestion**: Return HTTP 503 Service Unavailable with proper error telemetry.

---

## Recommendations Summary

1. **Phase 1: Immediate Access Control Hardening (Within 24 Hours)**:
   - Add `getSession(req)` validation to `POST /api/batches`, `PUT /api/batches/[id]`, `POST /api/farmers/register`, and `POST /api/dbt/disburse`.
   - Hardcode `role = "FIELD_OFFICER"` on public registrations (`POST /api/auth/register`).
   - Remove the `IS_VERCEL` guest authentication bypass in `POST /api/auth/login`.

2. **Phase 2: OTP & MFA Protection (Within 48 Hours)**:
   - Omit `devOtp` and `demoOtp` from all API response JSON in production environments.
   - Tie phone verification strictly to the authenticated user's session ID.

3. **Phase 3: Dependency Upgrades & Supply Chain (Within 1 Week)**:
   - Run `npm update nodemailer postcss` in `frontend` to patch known CVEs.

---

## Methodology

| Aspect | Details |
|--------|---------|
| Phases executed | 1 (Reconnaissance), 2 (White-Box), 3 (Gray-Box), 4 (Hotspots), 5 (Code Smells) |
| Frameworks detected | Next.js 14.2 (App Router), Prisma 6.19, PostgreSQL (Supabase), FastAPI 0.110, Solidity 0.8.24 (Hardhat) |
| White-box categories | Broken Access Control, Authentication, Cryptography, Injection, Supply Chain, Integrity, AI/LLM Security |
| Gray-box testing | Role escalation, unauthenticated state manipulation, parameter tampering, OTP leakage |
| Security hotspots | Smart contract escrow, commit-reveal QR hashing, joblib unpickling, hardware enclave ECDSA |
| Code smells | Vercel demo bypasses, ad-hoc JSON parsing, silent exception swallowing |
| Scope exclusions | None (full repository scanned) |
| OWASP Top 10:2025 | 10/10 categories evaluated |
| NIST CSF 2.0 | All 6 functions covered (GV, ID, PR, DE, RS, RC) |
| CWE | 8 unique CWE IDs identified |
| SANS/CWE Top 25 | 4/25 matched |
| Additional frameworks | OWASP ASVS 5.0, PCI DSS 4.0.1, MITRE ATT&CK, SOC 2, ISO 27001:2022 |

---

*Report generated by Claude Security Audit*
