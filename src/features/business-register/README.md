# Business Directory Registration

Self-serve wizard for local businesses at **`/business/register`**.

> This app uses **Vite + React** (not Next.js). The wizard delivers the same multi-step UX with React Hook Form, Zod, Framer Motion, Tailwind, and Supabase.

## Apply Supabase migration

In the Supabase SQL editor, run:

```
supabase/migrations/012_business_directory_registration.sql
```

This creates/extends:
- `businesses` columns for the full directory profile
- `status` values including `draft` + default publish gate (`pending` → `approved`)
- RPC `upsert_business_registration` / `get_business_draft`
- Storage bucket `business-media` with public read + registration uploads

## Status flow

| Status | Meaning |
|--------|---------|
| `draft` | Autosaved / “Save draft” — not in admin queue for publish |
| `pending` | Submitted — waiting for admin review |
| `approved` | Live in the public directory |
| `rejected` | Declined by admin |

## Local resume

Drafts are saved to `localStorage` (`rc_business_register_draft_v1`) and synced to Supabase when configured.
