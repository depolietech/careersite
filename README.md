# EqualHire — Bias-Free Career Platform

## Setup (once Node.js is installed)

```bash
# 1. Install Node.js LTS from https://nodejs.org

# 2. Open terminal in this folder
cd "Career Sites/bias-free-careers"

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.local.example .env.local
# Edit .env.local — the defaults work for local SQLite dev

# 5. Generate Prisma client + create database
npm run db:generate
npm run db:push

# 6. Start dev server
npm run dev
```

Open http://localhost:3000

## Project structure

```
app/
  page.tsx                     → Landing page
  (auth)/login                 → Sign in
  (auth)/register              → Sign up (role picker)
  (job-seeker)/dashboard       → Applicant dashboard
  (job-seeker)/jobs            → Job search
  (job-seeker)/profile         → Profile builder
  (employer)/dashboard         → Employer/contractor dashboard
  (employer)/post-job          → Post a job
  (employer)/applicants/[id]   → Masked candidate review + schedule interview
  api/auth/register            → Registration API
  api/jobs                     → Jobs CRUD
  api/applications             → Applications + masking
  api/applications/schedule    → Schedule interview (triggers reveal)

lib/
  masking.ts   → maskProfile() and revealProfile() — core bias logic
  auth.ts      → NextAuth config
  db.ts        → Prisma singleton

prisma/
  schema.prisma   → Database schema
```

## How masking works

- `maskProfile()` strips name, photo, company names, dates before sending to client
- `revealProfile()` returns full data — only called when `application.revealed === true`
- `revealed` is set to `true` atomically when an interview is scheduled (API route `/api/applications/schedule`)
- The masking happens server-side in API routes — masked data never touches the client
