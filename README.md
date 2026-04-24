# I Kali (Internet Jua Kali)

Premium local services marketplace for Nairobi, Kenya. Built with Next.js + Tailwind + Supabase-ready architecture.

## MVP Scope (Phase 1)
- Service discovery pages
- Provider listing and profile pages
- Lead request form (`/request`)
- Admin control placeholder (`/control`)

## Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase client setup

## Routes
- `/`
- `/services`
- `/services/[slug]`
- `/providers`
- `/providers/[slug]`
- `/request`
- `/become-a-pro`
- `/about`
- `/contact`
- `/control`

## Local development
```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and set your Supabase keys.

## Next phase
- Persist services/providers/job requests in Supabase
- Add search + location filtering in Nairobi
- Add auth for admin and providers
- Add M-Pesa payment and real-time booking workflows
