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
- Safety: `src/lib/contentSafety.ts` (crisis rule check, always on, plus Azure AI Content Safety when
  `AZURE_CONTENT_SAFETY_*` is set). `/api/gemini-chat` screens the user's message and the model's reply.
- PSS-10: `src/lib/pss10.ts` (items, scoring), `src/components/Pss10Card.tsx` (Profile tab). Stored in the profile bundle.
- Activity log: `src/lib/auditLog.ts` (browser), `src/lib/auditServer.ts` + `/api/audit` (table `baalance_audit_log`).
  `/api/calendar/reschedule` refuses to move anything without `approvedByUser: true` and logs every move.
- Data controls: `/api/storage/user-data` (GET export, DELETE), UI in `src/components/PrivacyAndActivityPanel.tsx`.
- Get help: `src/components/GetHelpPanel.tsx` (helplines by country, doctors near you), mounted once by
  `HelpPanelHost` in the layout and opened with `openHelpPanel()` from `src/lib/helplines.ts`. Numbers live in that file
  and were checked in November 2026; re-check before releases. `/api/doctors/nearby` uses Azure Maps (`AZURE_MAPS_KEY`).
  Location is asked for per search, rounded, and never stored. The app does not run a helpline or book appointments.
- Tricha agent: `src/lib/trichaAgent.ts` (Azure OpenAI tool calling, six read-only tools). `/api/gemini-chat` tries the
  agent first and falls back to the single-prompt reply, then to rule-based answers. Evidence for grounding lives in
  `src/lib/evidence.ts` (Azure AI Search when `AZURE_SEARCH_ENDPOINT` + admin `AZURE_SEARCH_KEY` are set: the app
  creates the index and reloads it whenever a passage changes, semantic ranking with keyword fallback; built-in search
  otherwise). Add only verified sources, conservative wording in our own words.
- Foundry Agent Service: `src/lib/foundryAgent.ts` creates/updates the `tricha` agent in the Foundry project from code
  (same instructions and tools as `trichaAgent.ts`) and runs each turn through `{endpoint}/openai/v1/responses`; tools run
  on our server. Needs `FOUNDRY_PROJECT_ENDPOINT` + `AZURE_TENANT_ID/CLIENT_ID/CLIENT_SECRET` (service principal with the
  Azure AI User role on the project). Chat order: Foundry agent, then direct Azure OpenAI agent, then single prompt.
  Reply `source` starts with `foundry-agent:` when Foundry answered.
- Prompt Shields run with Content Safety on every user message (`src/lib/contentSafety.ts`).
- `/azure` shows the live state of each Microsoft service from `/api/status`. `/api/mcp` is a small MCP server exposing
  the evidence library and helplines (no personal data).
- Evaluation: `node scripts/eval-tricha.mjs` runs 15 checks against the live chat and writes `docs/tricha-eval.md`.
  Run it after changing the prompt, tools or safety checks.
- Demo data: `src/lib/mockData.ts` (fictional "Sample Case"; July 11.2, August 28.4, September 15.6 pg/mg).

## Design system (set in November 2026)
- Palette from the logo: teal `#0D4F59` (primary buttons, active states), terracotta `#BF6F4E` (eyebrows, accents),
  cream canvas `#F6F2EC`, warm panels `#FBF7F2` with border `#EFE6DA`. `tailwind.config.ts` maps the `blue` and
  `indigo` scales to teal, so do not reintroduce a separate blue.
- Card pattern: `bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-5 sm:p-7`, then an uppercase terracotta
  eyebrow (11px), a `text-xl sm:text-2xl font-black` title and a one-line subtitle. Secondary buttons are white with a
  slate border.
- Sentence case, plain words, no emoji in the interface, no em dashes. No invented clinical or lab claims; label sample
  data as sample. Numbers shown to the user are computed from their data, never fixed text.
- Stress tab components: `StressSummary`, `InteractiveHairStrandViewer`, `StressScoreCard`, `ChronoCorrelationChart`,
  `GeminiProtocolCards` (the 3-step plan), `HairJourneyCard`. Profile tab: `ProfileSections.tsx`.

## Rules
- Never commit `.env.local`, user data or the pitch deck (the repo is public and the owner does not want the idea copied).
- Never store a calendar secret iCal URL on the server.
- Run `npx tsc --noEmit` and `npm run build` before committing.
- Owner's writing preference for any submission text: no em dashes.

## Branches
- Work on a branch, open a PR against `main`, merge when the Vercel preview check passes; Vercel deploys `main` to baalance.in.
- The live site runs on Azure OpenAI (`gpt-4.1-mini`) and Azure AI Content Safety (env vars set in Vercel).

## One-time setup still owed by the owner
1. Reset the Google Calendar secret iCal address (it leaked in old commits).
2. Run `supabase/migrations/20261107_lock_down_rls.sql` in the Supabase SQL Editor.
3. Microsoft Entra app registration, redirect `https://<project>.supabase.co/auth/v1/callback`,
   Graph delegated `User.Read` + `Calendars.ReadWrite`; enable the Azure provider in Supabase.
4. Azure OpenAI deployment and `AZURE_OPENAI_*` env vars in Vercel (see `.env.example`).
5. Run `supabase/migrations/20261118_audit_log.sql` in the Supabase SQL Editor (activity log table).
6. Azure AI Content Safety resource and `AZURE_CONTENT_SAFETY_*` env vars in Vercel. Set `AI_PROVIDER=azure`
   so Azure OpenAI is the model actually used.
7. PSS-10 is free for non-profit research and education; get the author's permission before commercial use.
