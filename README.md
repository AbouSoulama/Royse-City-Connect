# Royse City Connect

Mobile-first community web app for the African diaspora in Texas (Royse City, Dallas, Rockwall). Connect with local businesses, events, jobs, and verified community news — in **English** and **French**.

![Royse City Connect](public/logo.png)

---

## Features

### Community
- **Home** — Hero carousel, pinned announcements, upcoming events, featured businesses
- **News** — Unified community feed (posts, approved events, jobs, businesses)
- **Categories** — News, immigration, church, alerts, hospitality, real estate, and more
- **Businesses** — African-owned directory with verification
- **Events** — Calendar, RSVP, image uploads
- **Jobs** — Job board with applications/contact

### Users
- Email/password sign-up & sign-in
- **Google OAuth** (via Supabase)
- Guest mode
- Profile with avatar, bio, settings (EN/FR)
- Saved posts, notifications (realtime)
- **App feedback** — Ratings & suggestions for admins

### Admin
- Moderation dashboard (posts, businesses, events, jobs)
- Approve / reject / pin / feature content
- User feedback review
- Stats overview

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 4 |
| Backend | [Supabase](https://supabase.com) (Auth, PostgreSQL, Storage, Realtime) |
| Build | Single-file HTML output (`vite-plugin-singlefile`) |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/royse-city-connect.git
cd royse-city-connect
npm install
```

### 2. Environment variables

Copy the example file and add your Supabase keys:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Supabase → Project Settings → API**.

### 3. Database migrations

Run the SQL files **in order** in **Supabase → SQL Editor**:

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/migrations/001_initial_schema.sql` | Core schema + RLS |
| 2 | `supabase/migrations/002_rsvps_and_realtime.sql` | Event RSVPs + realtime |
| 3 | `supabase/migrations/003_storage.sql` | Media bucket + image columns |
| 4 | `supabase/migrations/004_jobs_image.sql` | Job images |
| 5 | `supabase/migrations/005_profile_bio.sql` | Profile bio field |
| 6 | `supabase/migrations/006_app_feedback.sql` | User feedback table |
| 7 | `supabase/migrations/007_oauth_profile.sql` | Google/OAuth profile trigger |
| 8 | `supabase/migrations/008_events_rls_fix.sql` | Events RLS fix |
| 9 | `supabase/migrations/009_post_categories.sql` | Hospitality & real estate categories |

### 4. Seed data (optional)

```sql
-- Run in Supabase SQL Editor
\i supabase/seed.sql
\i supabase/seed_businesses.sql
\i supabase/seed_events.sql
\i supabase/seed_jobs.sql
```

Or paste each file's contents manually.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

**Test on your phone** (same Wi‑Fi): use the Network URL shown in the terminal, e.g. `http://192.168.x.x:5174`

### 6. Production build

```bash
npm run build
npm run preview
```

Output: `dist/index.html` (single bundled file)

---

## Google OAuth setup

1. **Supabase → Authentication → Providers → Google** — Enable and add Client ID / Secret
2. **Google Cloud Console** — Create OAuth 2.0 credentials (Web)
   - Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. **Supabase → Authentication → URL Configuration** — Add redirect URLs:
   - `http://localhost:5174`
   - `http://YOUR_LOCAL_IP:5174` (for mobile testing)

---

## Admin access

Admin role is **not** self-assigned at sign-up.

1. Create an account in the app
2. In **Supabase → Table Editor → `profiles`**, set `role = 'admin'` for your user
3. Sign out and sign back in — **Admin dashboard** appears in Profile

---

## Project structure

```
src/
├── App.tsx                 # App shell & routing
├── components/             # UI (Layout, Posts, HomeHero, Feedback…)
├── contexts/AuthContext.tsx
├── hooks/useNotifications.ts
├── screens/                # Home, News, Businesses, Events, Jobs, Profile, Admin…
├── services/               # Supabase API (posts, events, jobs, businesses…)
├── i18n.ts                 # EN / FR translations
└── types/                  # TypeScript types

supabase/
├── migrations/             # SQL schema (001–009)
└── seed*.sql               # Demo data
```

---

## Content workflow

| Action | Visibility |
|--------|------------|
| User submits post / event / job / business | Status: `pending` |
| Admin approves | Status: `approved` → visible in app |
| Approved event / job / business | Also appears in **Community News** feed |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5174, network enabled) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Security notes

- Never commit `.env` — it is listed in `.gitignore`
- Row Level Security (RLS) is enabled on all Supabase tables
- Use the **anon** key in the frontend only; keep the **service role** key server-side

---

## License

Private / All rights reserved — update this section if you open-source the project.

---

## Support

Community app for Royse City & North Texas African diaspora.  
For issues or contributions, open a GitHub Issue or Pull Request.
