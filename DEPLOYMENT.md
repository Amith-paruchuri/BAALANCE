# Public Deployment Guide for baalance.in

This guide outlines the steps to deploy **BAALANCE** to your custom domain **`baalance.in`** using GitHub and Vercel.

---

## Step 1: Create the GitHub Repository

1. Open your browser and go to [https://github.com/new](https://github.com/new) (signed in as `amith-paruchuri`).
2. Set **Repository name** to: `BAALANCE`
3. Set visibility to **Public** (or **Private**).
4. **Do NOT** initialize with a README, .gitignore, or license (we have already created and committed these locally).
5. Click **Create repository**.

---

## Step 2: Push Local Code to GitHub

Your local repository is already initialized on the `main` branch with all platform files committed.

Run this single command in your terminal from `/Users/amithparuchuri/Documents/BAALANCE`:

```bash
git push -u origin main
```

*(If prompted, enter your GitHub Personal Access Token or authenticate via the GitHub browser prompt).*

---

## Step 3: Deploy to Vercel (1-Click Next.js Hosting)

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`amith-paruchuri/BAALANCE`** repository.
3. Framework Preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://nyxivqlpikoffdopfmei.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *(Your Supabase anon public key)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key for Tricha AI & report parsing)*
5. Click **Deploy**. Vercel will build the project in ~45 seconds.

---

## Step 4: Connect Your Domain `baalance.in`

1. In your Vercel Project dashboard, go to **Settings** → **Domains**.
2. Type in **`baalance.in`** and click **Add**.
3. Vercel will ask if you also want to redirect `www.baalance.in` to `baalance.in` (recommended: select **Yes**).
4. Vercel will display the required DNS records.

---

## Step 5: Configure DNS at Your Domain Registrar

Log in to the registrar where you purchased **`baalance.in`** (e.g. GoDaddy, Namecheap, Cloudflare, BigRock, etc.) and navigate to **DNS Management** / **DNS Records**:

| Type  | Name / Host | Value / Points To      | TTL       |
|-------|-------------|------------------------|-----------|
| **A** | `@` (or blank)| `76.76.21.21`          | Automatic |
| **CNAME** | `www`   | `cname.vercel-dns.com` | Automatic |

*Once saved, DNS changes usually propagate within 5 to 15 minutes. Vercel will automatically generate and renew a free SSL (HTTPS) certificate for `https://baalance.in`.*

---

## Platform Summary
- **App Framework**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **AI Engine**: Google Gemini 2.5 Flash (`@google/genai`)
- **Backend / Database**: Supabase PostgreSQL + Indian Holiday Calendaring + iCal Parser
- **Live Domain Target**: `https://baalance.in`
