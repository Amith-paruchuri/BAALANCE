# BAALANCE: notes for Claude Code

BAALANCE measures three months of stress from a small lock of hair (hair cortisol,
1 cm of hair is about 1 month), then uses AI plus the user's calendar to explain
what caused it and suggest changes. Tagline: "Hair keeps the receipts".
Live at https://baalance.in (deployed on Vercel from `main`).

Current goal: submission to the Future Health Digital Innovation Challenge
(Hack2skill, Abu Dhabi, co-created with Microsoft, MBZUAI and Inception42).
Because Microsoft co-hosts it, do not name "Gemini" in visible UI text; say "AI"
or "BAALANCE AI". Prefer Microsoft features (Outlook/Teams via Graph, Azure OpenAI).

## Stack
- Next.js 14 App Router, TypeScript, Tailwind. Main screen: `src/app/page.tsx` (large, ~2,500 lines).
- Supabase: Auth (email/password, Google, Azure/Microsoft) and Postgres with row-level security.
- AI: `src/lib/ai.ts` is the only place that calls a model. `AI_PROVIDER=gemini|azure|auto`.
- Calendar: `src/lib/calendarProviders.ts` (Google Calendar API + Microsoft Graph, normalised events,
  reschedule via PATCH, iCal host allowlist). Routes: `/api/calendar`, `/api/calendar/reschedule`.
- Server auth helpers: `src/lib/serverAuth.ts` (verify Bearer token, per-IP rate limit).
  Client calls to `/api/*` must go through `apiFetch` (`src/lib/apiFetch.ts`) so the token is attached.
- Demo data: `src/lib/mockData.ts` (fictional "Sample Case"; July 11.2, August 28.4, September 15.6 pg/mg).

## Rules
- Never commit `.env.local`, user data or the pitch deck (the repo is public and the owner does not want the idea copied).
- Never store a calendar secret iCal URL on the server.
- Run `npx tsc --noEmit` and `npm run build` before committing.
- Owner's writing preference for any submission text: no em dashes.

## Branches
- `security-microsoft-ux` (PR #1): security fixes, Microsoft sign-in, Outlook/Teams, Azure OpenAI layer.
- `ux-pass` (PR #2, built on #1): hydration fix, mobile navbar, sample-case banner, Gemini removed from visible UI.
- Merge #1 then #2 into `main`; Vercel then deploys.

## One-time setup still owed by the owner
1. Reset the Google Calendar secret iCal address (it leaked in old commits).
2. Run `supabase/migrations/20261107_lock_down_rls.sql` in the Supabase SQL Editor.
3. Microsoft Entra app registration, redirect `https://<project>.supabase.co/auth/v1/callback`,
   Graph delegated `User.Read` + `Calendars.ReadWrite`; enable the Azure provider in Supabase.
4. Optional: Azure OpenAI deployment and `AZURE_OPENAI_*` env vars in Vercel (see `.env.example`).
