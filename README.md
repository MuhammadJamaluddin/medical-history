# Medical History

A personal medical-memory app for people who want a quiet, private place to remember care — for themselves and the people they look after.

This is **not** an EHR, not medical advice, and not a clinician portal. It is a Timeline of freeform Events you control.

## Why

Medical history lives in scattered portals, paper folders, and half-remembered conversations. When you need a clear story — for a specialist visit, a family member’s care, or your own continuity — you often reconstruct it under pressure.

**Medical History** gives you one Account, multiple **Personas** (you, a parent, a child), and a chronological **Timeline** of what happened and when.

## Product model

Domain language lives in [`CONTEXT.md`](./CONTEXT.md). Short version:

| Concept | Meaning |
|--------|---------|
| **Account** | Your login. The only party that can see your data. |
| **Self Persona** | Created on signup for your own history. Default Timeline. |
| **Persona** | Any person under your Account (self, mother, child, …). |
| **Event** | Freeform note: title, **occurred-on** date, body, optional tags & files. |
| **Timeline** | Events for one Persona, ordered by when care happened. |
| **Attachment** | PDF/image/etc. on an Event; deleted with the Event. |

v1 deliberately stays simple: one set of credentials, full access to all Personas under that Account, hard delete, no share links or care-team roles.

## Features (v1)

- Email/password auth (Supabase)
- Automatic **Self Persona** on signup
- **Timeline** for the active Persona
- **New Event** form: title, occurred-on, notes, comma-separated tags, multi-file attachments
- Hard **delete** Event (and its storage files)
- Row Level Security: every row scoped to `auth.uid()`

## Stack

| Layer | Choice |
|-------|--------|
| App | [Next.js](https://nextjs.org) (App Router) · TypeScript · Tailwind · [shadcn/ui](https://ui.shadcn.com) |
| Auth · DB · files | [Supabase](https://supabase.com) (Auth, Postgres, Storage) |
| Schema helper | [Drizzle](https://orm.drizzle.team) (typed mirror of SQL) |
| Deploy target | [Vercel](https://vercel.com) |

Decision record: [`docs/adr/0001-nextjs-supabase-stack.md`](./docs/adr/0001-nextjs-supabase-stack.md).

## Quick start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (or the Supabase CLI)

### 1. Clone and install

```bash
git clone https://github.com/MuhammadJamaluddin/medical-history.git
cd medical-history
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
```

Optional: `SUPABASE_SERVICE_ROLE_KEY` for admin scripts only — never expose it to the browser.

### 3. Database and storage

Apply the migration (SQL editor, or CLI if the project is linked):

```bash
# With Supabase CLI linked to your project:
supabase db push
```

Or paste [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) into the Supabase SQL editor.

That migration creates:

- Tables: `personas`, `events`, `tags`, `event_tags`, `attachments`
- RLS policies (Account-owned rows only)
- Trigger: **Self Persona** when a user signs up

Create a **private** Storage bucket named `attachments`. Objects should live under `{account_id}/{event_id}/…` so path-based policies can enforce ownership (see the storage policies applied with the project setup, or recreate equivalent policies in the dashboard).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Get started** → sign up → **Timeline** → **Add Event**.

If email confirmation is enabled in Supabase Auth, either confirm the email or disable “Confirm email” under Authentication → Providers for local development.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Drizzle: generate from schema |
| `npm run db:push` | Drizzle: push schema (optional; SQL migration is source of truth for Supabase) |
| `npm run db:studio` | Drizzle Studio |

## Project layout

```
├── CONTEXT.md                 # Domain glossary (no implementation)
├── docs/adr/                  # Architecture decisions
├── supabase/migrations/       # Postgres + RLS + signup trigger
├── src/
│   ├── app/                   # Routes: /, /login, /timeline, auth callback
│   ├── components/            # UI + New Event / delete / sign-out
│   ├── db/                    # Drizzle schema mirror
│   └── lib/supabase/          # Browser, server, middleware clients
```

## Privacy & safety

- Data is private to the signed-in Account by design (RLS).
- Attachments are stored in a **private** bucket.
- Hard deletes are permanent — this is a personal notebook, not regulated clinical retention.
- Do not commit `.env.local` or service-role keys.
- Not a substitute for professional medical records or advice.

## Roadmap (not in v1)

- Persona switcher UI (add mother/child Personas)
- Tag filter on Timeline
- Attachment download / preview
- Search across Events
- Export (PDF / JSON) for a doctor visit

## License

Private / unlicensed unless you add a `LICENSE` file. Treat health data with care if you fork or deploy.
