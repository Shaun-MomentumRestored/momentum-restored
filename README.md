# Momentum Restored — Client Portal

A full-stack business coaching portal with a private dashboard for each client and a password-protected coach view.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4** (CSS-based config, no `tailwind.config.ts`)
- **Prisma 7** with `@prisma/adapter-better-sqlite3` + SQLite
- **shadcn/ui**-style Radix UI components

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
COACH_PASSWORD="momentum2025"
```

### 3. Create the database

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/coach`.

---

## Routes

| Route | Description |
|---|---|
| `/coach` | Coach dashboard (password: `momentum2025`) |
| `/coach/wins` | All shareable client wins for marketing |
| `/coach/client/[id]` | Coach view of a specific client's portal |
| `/client/[slug]` | Client's private portal (no password needed) |

---

## Features

### Coach Dashboard (`/coach`)

- View all clients with: last active, this week task completion %, wins this month, abandoned timers
- Add clients by name and email — unique URL is auto-generated
- Click any client to view their full portal
- Copy portal URL to clipboard from the dashboard
- Sign out via the nav button

### Client Portal (`/client/[slug]`)

**Weekly Tasks**
- Create named weeks (e.g. "W/C 19 May")
- Add tasks with estimated duration
- Countdown timer per task: Start → counts down → Done or Need More Time
- Mon–Sun day checkboxes per task
- Tracks: estimated time, actual time, sessions completed
- Browser close mid-session is detected and marked as Abandoned

**Results & Wins**
- Categorised wins with optional £ value and detail
- `shareOk` checkbox controls marketing use visibility on `/coach/wins`

**12 Month Goal**
- Headline, 3 milestones, why it matters
- Committed toggle

**Monthly Goals**
- Month picker with persistent checklist per month

**Meeting Notes**
- Date, session number, notes and actions agreed

**Excuse vs Reality Journal**
- Excuse / Reality / Action log, newest first

**Revenue Task Tracker**
- Monthly target and actual (£) with progress bar
- Task list with potential value and done checkbox

**Execution Contract**
- 4 commitment fields, consequences, sign toggle with timestamp

---

## Deploying to Vercel

> **Important**: SQLite is a local file database. On Vercel, the filesystem is read-only and doesn't persist between invocations. For Vercel you need a hosted database.

### Option A — Turso (libSQL, recommended)

1. Create a free database at [turso.tech](https://turso.tech)
2. Install the Turso adapter:
   ```bash
   npm install @prisma/adapter-libsql @libsql/client
   ```
3. Update `prisma.config.ts` and `src/lib/prisma.ts`:
   ```ts
   // src/lib/prisma.ts
   import { PrismaClient } from "@/generated/prisma/client";
   import { PrismaLibSQL } from "@prisma/adapter-libsql";
   import { createClient } from "@libsql/client";

   const client = createClient({
     url: process.env.TURSO_DATABASE_URL!,
     authToken: process.env.TURSO_AUTH_TOKEN,
   });
   const adapter = new PrismaLibSQL(client);
   
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
   export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
   ```
4. Run `npx prisma migrate deploy` to apply migrations to Turso
5. Add env vars in Vercel: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `COACH_PASSWORD`

### Option B — Self-host on a VPS

SQLite works perfectly on a persistent server (DigitalOcean, Hetzner, Railway, etc.):

```bash
npm run build
node .next/standalone/server.js
```

---

## Vercel Deployment Steps

1. Push this repo to GitHub
2. Connect the repo to Vercel at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard (see Option A above)
4. Click **Deploy**

---

## Custom Domain

1. In Vercel dashboard → **Settings → Domains**
2. Add your domain (e.g. `portal.momentumrestored.com`)
3. Add the DNS records Vercel provides at your domain registrar:
   - `CNAME` pointing to `cname.vercel-dns.com` (subdomains), or
   - `A` record pointing to `76.76.21.21` (root domain)
4. Vercel automatically provisions SSL

---

## Sharing Client Portal URLs

Each client's URL is: `https://yourdomain.com/client/[slug]`

The URL appears on the coach dashboard — click the Copy button. Clients need no password, their URL is their access.

---

## Changing the Coach Password

1. Local: update `COACH_PASSWORD` in `.env`
2. Vercel: update the env var in the dashboard and redeploy
3. Sign out and sign in with the new password

---

## Database Schema

| Table | Key fields |
|---|---|
| `Client` | name, email, slug, lastActive |
| `Week` | label, clientId |
| `Task` | name, estimatedMins, actualMins, timerState (JSON), completedDays (JSON), sessions, abandoned |
| `Win` | category, headline, value, detail, shareOk |
| `Goal12Month` | headline, milestone1-3, whyMatters, committed |
| `MonthlyGoal` | month (YYYY-MM), items (JSON array) |
| `MeetingNote` | date, sessionNumber, notes, actions |
| `JournalEntry` | excuse, reality, action |
| `RevenueTracker` | month, target, actual, tasks (JSON) |
| `ExecutionContract` | commitment1-4, consequences, signed, signedAt |
