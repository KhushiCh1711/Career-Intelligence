# Pathway — Backend

Express + MongoDB (Mongoose) API for the Pathway career-readiness platform. Multi-tenant: every
authenticated request carries `role`, `tenantId`, and (for students) `refId` inside its access
token, and every query is scoped by that — a university admin's queries are hard-filtered to
`{ collegeId: req.auth.tenantId }`, a company's to its own `companyId`.

## Setup

You need a MongoDB instance reachable at `MONGODB_URI` — either local (`mongod` running on
`localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
cp .env.example .env      # then edit MONGODB_URI and JWT secrets
npm install
npm run seed                # wipes and re-seeds demo tenants/students/companies
npm run dev                  # http://localhost:4000
```

## Data model

- **College** — a university tenant (`_id` like `"ccsu"`)
- **Company** — a hiring tenant, with its `roles` embedded directly on the document
- **Student** — belongs to exactly one `collegeId`; `skills`, `history`, and `roadmap` are
  embedded on the student document (no joins needed for the dashboard's hot path)
- **Shortlist** — the one cross-tenant *write*: a company bookmarking a student from any college
- **User** — one login identity per role; carries `tenantId`/`refId`, which become the JWT payload

## Auth model

Two-token pattern:
- **Access token** — short-lived JWT (15m default), returned in the JSON body. The frontend keeps
  it in memory only (never localStorage) and sends `Authorization: Bearer <token>`.
- **Refresh token** — random opaque string, sent as an `httpOnly` cookie scoped to `/api/auth`.
  Only its SHA-256 hash is stored in the `User` document. `/api/auth/refresh` rotates it on every
  use; if a presented token doesn't match any stored hash, that's treated as possible reuse and
  the session is rejected.

## Demo accounts (after `npm run seed`)

Password for every account: `demo1234`

| Role | Username pattern | Example |
|---|---|---|
| Student | `<studentId>@student.edu` | `ccsu-s0@student.edu` |
| University | `admin@<collegeId>.edu` | `admin@ccsu.edu` |
| Company | `hiring@<companyId>.com` | `hiring@infosys.com` |

College ids: `ccsu`, `dit`, `pni`. Company ids: `infosys`, `razorpay`, `deloitte`, `zeta`.

## Endpoints

- `POST /api/auth/login`, `/refresh`, `/logout`
- `GET /api/auth/colleges`, `/companies`, `/colleges/:id/students` (public, for the sign-in screen)
- `GET /api/students/me`, `PATCH /api/students/me/roadmap/:stepId`, `POST /api/students/me/simulate`
- `GET /api/university/overview`, `/students`
- `GET /api/company/roles`, `/matches?roleId=`, `POST /shortlist/:studentId`, `GET /shortlist`
- `POST /api/ai/ask` — `{ question, language: "english" | "hinglish" }`. Calls the Gemini API
  with the student's real skills/roles/roadmap as context, so it answers open-ended questions
  instead of picking from fixed replies. Falls back to a short offline message if
  `GEMINI_API_KEY` isn't set or the API call fails, so the assistant never just breaks.

## AI assistant (Gemini)

1. Get a free key at https://aistudio.google.com/app/apikey
2. Put it in `backend/.env` as `GEMINI_API_KEY=...`
3. Restart `npm run dev` — no other setup needed (uses Node's built-in `fetch`, no extra package)

The student's skills, readiness, matched roles, and roadmap are sent as context on every request,
so answers stay grounded in real data instead of the model guessing. Language is controlled per
request (`language: "hinglish"` for a Hindi-English mix in Latin script, `"english"` otherwise) —
the frontend's assistant panel has a toggle for this.
