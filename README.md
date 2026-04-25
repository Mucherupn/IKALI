# I Kali (Internet Jua Kali)

I Kali is a Kenya-wide local services marketplace MVP that helps customers discover trusted professionals, compare profiles, and submit service requests quickly.

This Phase 11 pass focuses on **stability, safety, mobile UX, and production readiness** for founder-led testing.

## Tech stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shared utility classes in `src/app/globals.css`
- **Data:** Supabase (Postgres + APIs), with mock fallbacks for resilience
- **Payments readiness:** M-Pesa Daraja integration scaffolding (safe, non-faking API behavior)

## Route map

### Public routes
- `/` — Home + global search
- `/services` — Service categories
- `/services/[slug]` — Service detail + relevant providers
- `/providers` — Provider directory + filters
- `/providers/[slug]` — Provider profile + trust indicators
- `/request` — Customer booking request form
- `/become-a-pro` — Provider onboarding info
- `/about` — Marketplace overview
- `/contact` — Contact details
- `/trust` — Trust and safety guidance

### Internal route
- `/control` — Admin operations dashboard (**not production-secured yet**)

### API routes
- `/api/payments/mpesa/stk` — STK request validation + config gating (no fake success)
- `/api/payments/mpesa/callback` — Callback acknowledgement only (does not mark payments successful)

## Environment variables

Copy `.env.example` to `.env.local`.

### Required for Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Required for M-Pesa readiness (server-side)
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MPESA_ENV` (`sandbox` or `production`)

> Never expose secret keys in client code. Do not use Supabase service role keys in browser bundles.

## Supabase setup

1. Create a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
3. Apply SQL migrations in order:
   - `supabase/phase5_schema.sql`
   - `supabase/phase9_booking_workflow.sql`
   - `supabase/phase10_payment_readiness.sql`
4. Seed service categories and providers for realistic directory behavior.

## Payment readiness notes

- STK endpoint validates payloads and environment before any payment logic.
- Missing payment credentials return safe, explicit `503` responses.
- Callback endpoint **does not** claim payment success; it acknowledges receipt with `202` and a clear “not reconciled yet” message.
- Production payment execution and callback reconciliation are intentionally deferred until secure implementation.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Current limitations

- `/control` lacks authentication/authorization and is for internal MVP usage only.
- Review moderation and dispute workflows are placeholders.
- M-Pesa live transaction execution/reconciliation is not enabled yet.
- Some flows rely on mock fallback data when Supabase is unavailable.

## Recommended next steps

1. Add auth + RBAC for `/control`.
2. Implement server-side M-Pesa OAuth/STK + secure callback verification.
3. Add end-to-end tests for booking/admin/payment routes.
4. Add observability (structured logs, request tracing, uptime alerts).
5. Harden input validation and rate-limit critical routes.
