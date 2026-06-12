# SplitEasy — Architecture & Design Document

**Version:** 2.0  
**Project:** SplitEasy Bill Splitter  
**Team:** Laiba Khan [22k-4610] · Ansharah Asad [22K-4411]  
**Live URL:** https://d24cnfvnjyoevy.cloudfront.net/

---

## 1. Executive Summary

SplitEasy is a cloud-native, serverless bill-splitting web application built on AWS. Users authenticate via Amazon Cognito, create shared expense splits, and track payment history — all without managing any backend servers. The architecture is designed for zero-idle cost, automatic scaling, and high availability.

---

## 2. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                            │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Amazon CloudFront (CDN)                        │
│           Global edge delivery · SSL/TLS termination              │
│           Cache-Control headers · Gzip compression                │
└────────┬───────────────────────────────────────┬───────────────────┘
         │ Static assets (HTML/JS/CSS)            │ API requests
         ▼                                        ▼
┌─────────────────────┐              ┌────────────────────────────────┐
│   Amazon S3 Bucket  │              │  Amazon API Gateway (REST)     │
│  React SPA (dist/)  │              │  Stage: Prod                   │
│  index.html + assets│              │  CORS: enabled for all origins │
└─────────────────────┘              └────────────┬───────────────────┘
                                                  │ JWT validation
                                                  ▼
                                     ┌────────────────────────────┐
                                     │   Amazon Cognito Authorizer│
                                     │   Validates Bearer token   │
                                     └──────────┬─────────────────┘
                                                │ userId (sub claim)
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                   │  CreateSplit │  │  GetSplits   │  │  DeleteSplit │
                   │   Lambda     │  │   Lambda     │  │   Lambda     │
                   │  POST /splits│  │ GET /splits  │  │DELETE /splits│
                   │             │  │              │  │  /{createdAt}│
                   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                          │                 │                 │
                          └─────────────────┼─────────────────┘
                                            ▼
                              ┌─────────────────────────┐
                              │     Amazon DynamoDB      │
                              │  Table: SplitEasySplits  │
                              │  PK: userId | SK: createdAt│
                              └─────────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React.js | 19.x |
| Build Tool | Vite | 8.x |
| Auth SDK | AWS Amplify | 6.x |
| HTTP Client | fetch (native) | — |
| Routing | React state machine | — |
| Fonts | DM Sans + DM Serif Display | — |

### 3.2 Application Flow (State Machine)

```
[App.jsx state: page]
        │
        ├── unauthenticated + page="landing"  →  <LandingPage>
        │         │ "Get started" / "Sign in"
        ├── unauthenticated + page="login"    →  <Login>
        │         │ success
        ├── unauthenticated + page="signup"   →  <Signup>
        │         │ confirmed
        │         ▼
        └── authenticated                     →  <Dashboard>
                  │ sign out
                  └─→ page="landing"
```

### 3.3 Component Tree

```
App.jsx                   (auth gate, session restore)
├── LandingPage.jsx        (marketing page, unauthenticated default)
├── Login.jsx              (centered auth form + component library exports)
│   ├── Logo
│   ├── Label
│   ├── Input
│   ├── PrimaryBtn
│   ├── ErrorBox
│   └── AuthFooter
├── Signup.jsx             (2-step: create + verify email)
└── Dashboard.jsx          (main app: splits, history, stats)
```

### 3.4 Page Descriptions

#### LandingPage.jsx
- Dark full-viewport marketing page shown to unauthenticated users
- Sections: Nav → Hero → Features → How It Works → AWS Stack → CTA → Footer
- Entry point for "Get started" and "Sign in" flows

#### Login.jsx
- Clean centered dark form, no promotional panel
- Handles `signIn()` via AWS Amplify
- Exports shared UI components (Logo, Label, Input, PrimaryBtn, ErrorBox, AuthFooter)

#### Signup.jsx
- Two-step flow: account creation → email verification
- Password strength meter (5 rules: length, uppercase, lowercase, number, special char)
- Handles `signUp()` + `confirmSignUp()` via AWS Amplify

#### Dashboard.jsx
- Authenticated main view
- Features: create split, history with delete, search/filter, currency selector
- Stats: total splits, total amount tracked, total people
- Calls `/splits` GET and POST endpoints; `/splits/{createdAt}` DELETE endpoint

---

## 4. Backend Architecture

### 4.1 Lambda Functions

#### CreateSplit (`POST /splits`)
```
Input  (authenticated):
  { billName: string, totalAmount: number, people: string[] }

Validation:
  - billName must not be empty
  - totalAmount must be ≥ 0
  - people must be non-empty array

Processing:
  - Deduplicate people names
  - Calculate equal share: totalAmount / uniquePeople.length
  - Round to 2 decimal places
  - Generate UUID (splitId), capture ISO timestamp (createdAt)

Output (201):
  { message, split: { userId, splitId, billName, totalAmount, people[], createdAt } }
```

#### GetSplits (`GET /splits`)
```
Processing:
  - Query DynamoDB: KeyConditionExpression "userId = :userId"
  - ScanIndexForward: false (newest first)

Output (200):
  { splits: [...] }
```

#### DeleteSplit (`DELETE /splits/{createdAt}`)
```
Input (authenticated):
  createdAt — URL-encoded ISO timestamp from path parameter

Processing:
  - userId from JWT sub claim (tamper-proof)
  - DeleteItem with Key: { userId, createdAt }
  - DynamoDB key ensures users can only delete their own items

Output (200):
  { message: "Split deleted successfully" }
```

### 4.2 Calculation Logic (`calculate.js`)

```
calculateSplit(totalAmount, people):
  1. Validate: amount is a non-negative number
  2. Validate: people is a non-empty array
  3. Deduplicate names (case-sensitive)
  4. share = Math.round((totalAmount / n) * 100) / 100
  5. Return: [{ name, owes }, ...]
```

---

## 5. Database Design

### 5.1 DynamoDB Table: `SplitEasySplits`

| Attribute | Type | Role | Description |
|-----------|------|------|-------------|
| `userId` | String | Partition Key (PK) | Cognito JWT `sub` claim — unique per user |
| `createdAt` | String | Sort Key (SK) | ISO 8601 timestamp — enables range queries |
| `splitId` | String | — | UUID, used for UI keys |
| `billName` | String | — | Human-readable bill name |
| `totalAmount` | Number | — | Total bill amount |
| `people` | List | — | Array of `{ name, owes }` objects |

**Billing Mode:** PAY_PER_REQUEST (on-demand — no cost when idle)

**Access Patterns:**

| Query | Key Expression | Notes |
|-------|---------------|-------|
| Get all user splits | `userId = :uid` | Returns newest-first via `ScanIndexForward: false` |
| Delete a split | `userId = :uid, createdAt = :ts` | Both keys required; isolates by user |

---

## 6. Authentication & Security

### 6.1 Flow

```
1. User submits email/password on Login page
2. Amplify SDK calls Cognito SignIn API
3. Cognito returns JWT tokens (idToken, accessToken, refreshToken)
4. idToken stored in Amplify's internal session (localStorage)
5. On each API call, Dashboard.jsx calls fetchAuthSession() to get fresh idToken
6. idToken sent as Authorization header to API Gateway
7. API Gateway Cognito Authorizer validates JWT signature + expiry
8. On success, injects claims into event.requestContext.authorizer.claims
9. Lambda reads userId from claims.sub (not user input — tamper-proof)
```

### 6.2 Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | Amazon Cognito User Pool with email verification |
| Transport Security | HTTPS enforced via CloudFront |
| API Authorization | JWT validation on every request via Cognito Authorizer |
| Data Isolation | `userId` (from JWT) used as DynamoDB PK — users can only access their own data |
| IAM Principle of Least Privilege | Lambda roles scoped to single DynamoDB table (CRUD for Create, Read-only for Get) |
| CORS | API Gateway CORS configured; accepts all origins (suitable for public API) |

---

## 7. Infrastructure as Code (AWS SAM)

### 7.1 Resources Provisioned

```yaml
SplitsTable          → DynamoDB table (PAY_PER_REQUEST)
SplitEasyUserPool    → Cognito User Pool (email auth + auto-verification)
SplitEasyUserPoolClient → Cognito App Client (no secret — public SPA)
SplitEasyApi         → API Gateway REST API (Stage: Prod, CORS enabled)
CreateSplitFunction  → Lambda (POST /splits)
GetSplitsFunction    → Lambda (GET /splits)
DeleteSplitFunction  → Lambda (DELETE /splits/{createdAt})
```

### 7.2 Deployment

**Backend:**
```bash
cd SplitEasy-Bill-Splitter
sam build
sam deploy   # uses samconfig.toml — stack: spliteasy-stack, region: us-east-1
```

**Frontend:**
```bash
cd frontend
npm install
npm run build   # outputs to dist/
aws s3 sync dist/ s3://YOUR_S3_BUCKET_NAME --delete
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**Environment Variables (frontend `.env.local`):**
```
VITE_USER_POOL_ID=us-east-1_or0OUcvIP
VITE_USER_POOL_CLIENT_ID=42rgoi60odn5q0otrginer8l8k
VITE_API_URL=https://hmgwnjx1z1.execute-api.us-east-1.amazonaws.com/Prod
```

---

## 8. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automates:

1. **Test** — runs `npm test` in the backend on every push
2. **Deploy Backend** — `sam build && sam deploy` on pushes to `main`
3. **Build Frontend** — `npm run build` using secrets as env vars
4. **Deploy Frontend** — `aws s3 sync` + CloudFront cache invalidation

Required GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_API_URL`

---

## 9. Request / Response Examples

### Create Split

**Request:**
```http
POST /splits
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "billName": "Dinner at Kolachi",
  "totalAmount": 1500,
  "people": ["Ali", "Sara", "Usman"]
}
```

**Response (201):**
```json
{
  "message": "Split created successfully",
  "split": {
    "userId": "cognito-sub-uuid",
    "splitId": "b1f2c3d4-...",
    "billName": "Dinner at Kolachi",
    "totalAmount": 1500,
    "people": [
      { "name": "Ali",   "owes": 500 },
      { "name": "Sara",  "owes": 500 },
      { "name": "Usman", "owes": 500 }
    ],
    "createdAt": "2025-06-12T10:30:00.000Z"
  }
}
```

### Delete Split

**Request:**
```http
DELETE /splits/2025-06-12T10%3A30%3A00.000Z
Authorization: Bearer <idToken>
```

**Response (200):**
```json
{ "message": "Split deleted successfully" }
```

---

## 10. Design Decisions & Trade-offs

| Decision | Choice | Reason |
|----------|--------|--------|
| DynamoDB sort key | `createdAt` (ISO string) | Enables range queries and natural time-ordering without a GSI |
| Auth provider | Amazon Cognito | Managed service — no password storage, free tier up to 50k MAU |
| Routing | React state machine | No React Router needed for 3 pages; reduces bundle size |
| CSS approach | CSS-in-JS objects | Zero runtime cost vs Tailwind, co-located with components |
| Split calculation | Backend Lambda | Ensures consistency; prevents client-side tampering |
| IaC tool | AWS SAM | Higher-level than raw CloudFormation; first-class Lambda support |
| CDN | CloudFront | Mandatory for HTTPS on S3 static sites; global edge caching |

---

## 11. Scalability & Cost Model

| Component | Scale Model | Free Tier |
|-----------|------------|-----------|
| Lambda | 0 → millions of requests automatically | 1M requests/month |
| DynamoDB | On-demand pricing, no minimum | 25 GB storage, 200M requests/month |
| API Gateway | Per-request billing | 1M calls/month (12 months) |
| Cognito | Per MAU pricing | 50,000 MAU free |
| CloudFront | Per-request + data transfer | 1 TB data, 10M requests/month (12 months) |
| S3 | Storage + request pricing | 5 GB storage, 20k GET requests/month |

**Estimated cost at zero traffic: $0.00/month**  
**Estimated cost at 10,000 active users: ~$0–5/month**

---

## 12. Future Enhancements

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Unequal splits | Medium | New `splitMode` field + weighted calculation |
| Group management | High | New `groups` table + GSI on groupId |
| Expense categories | Low | Add `category` field + filter in frontend |
| Export to CSV/PDF | Medium | Lambda generates presigned S3 URL |
| Email notifications | Medium | SES integration in CreateSplit Lambda |
| Multi-currency | Low | Frontend currency selector + exchange rate API |
| Mobile app | High | React Native sharing the same backend |
| Dark mode | Low | CSS custom properties + localStorage preference |
