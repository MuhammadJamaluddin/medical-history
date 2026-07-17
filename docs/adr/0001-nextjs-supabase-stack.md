# Next.js + Supabase for the personal medical-history app

We need a modern, minimal web app with Account auth, relational Personas/Events, and private file Attachments. We chose **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**, **Supabase** (Auth, Postgres, Storage), **Drizzle** for typed schema access, and **Vercel** for hosting — web-first, delightful UI, Account-scoped data without building auth/storage ourselves.

**Considered:** Vite + React + Supabase (thinner but more DIY); React Native first (wrong default for Timeline/Attachments UX).
