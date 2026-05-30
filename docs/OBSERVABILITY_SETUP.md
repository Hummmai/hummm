# Observability & Analytics Setup (Phase 4.5)

## 1. Error Tracking (Recommended: Sentry)

### Why Sentry?
- Excellent React Error Boundary integration
- Source maps + release tracking
- Performance monitoring (transactions)
- Much better than raw Supabase logs for production

### Quick Setup

1. Create a Sentry project (https://sentry.io)
2. Install:
   ```bash
   npm install @sentry/react
   # or
   bun add @sentry/react
   ```

3. Initialize in `src/main.tsx` (or `src/App.tsx`):

```tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2, // Adjust in production
    environment: import.meta.env.MODE,
  });
}
```

4. The existing `ErrorBoundary` already calls `reportError`, which you can enhance to also call `Sentry.captureException`.

## 2. Product Analytics (Recommended: PostHog or Plausible)

We have a lightweight `src/lib/analytics.ts` that currently:
- Logs to console in dev
- Tries to insert into Supabase tables

### Supabase Tables (Quick & Free Option)

Run these in the Supabase SQL editor:

```sql
-- Analytics events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  properties jsonb,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

-- Only service role can insert (recommended)
create policy "Service role can insert analytics"
  on public.analytics_events for insert
  to service_role
  with check (true);

-- Error reports
create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  stack text,
  component_stack text,
  url text,
  user_id uuid references auth.users(id),
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.error_reports enable row level security;

create policy "Service role can insert errors"
  on public.error_reports for insert
  to service_role
  with check (true);
```

Then in your Edge Functions or a small cron, you can analyze these tables.

## 3. Current Tracked Events

- `valuation_started`
- `valuation_completed`
- `audit_saved`
- `negotiation_initiated`
- `upgrade_clicked`
- `pro_paywall_viewed`

These are already wired into the valuation and negotiation flows.

## 4. Recommended Production Stack

- **Errors**: Sentry (primary) + Supabase `error_reports` as backup
- **Product Analytics**: PostHog (self-hostable) or Plausible (privacy-friendly)
- **Logs**: Supabase Edge Function logs + Sentry

This setup gives you good visibility without much cost or complexity at launch.
