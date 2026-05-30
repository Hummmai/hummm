# Hummm.pro Launch Readiness Checklist (Phase 4.5)

## Environment & Secrets (Supabase + Stripe + External APIs)
- [ ] SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- [ ] STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET
- [ ] PROPERTYDATA_API_KEY
- [ ] LOVABLE_API_KEY (or OpenAI equivalent)
- [ ] FIRECRAWL_API_KEY
- [ ] IDEAL_POSTCODES_API_KEY (if still used)
- [ ] SUPABASE_OWNER_USER_IDS (preferred) or SUPABASE_OWNER_EMAILS for owner bypass
- [ ] All Edge Functions deployed with correct secrets

## Rate Limiting & Abuse Protection
- [ ] Consider adding per-user rate limits on `can-audit`, `deal-audit`, `scrape-property`, and `generate-ai-valuation`
- [ ] Monitor Firecrawl / PropertyData usage (they are paid)
- [ ] Add basic abuse detection on high-volume free audit usage

## Error Tracking & Observability
- [ ] Sentry or similar error tracking integrated (especially around ErrorBoundary in audit flow)
- [ ] Log key events: audit started/completed, scrape success rate, price confidence distribution
- [ ] Set up alerts for high failure rate on scraping functions

## Database & RLS
- [ ] RLS policies on `audit_usage`, `saved_audits`, `ai_valuations` are strict
- [ ] `increment_audit_count` RPC is properly secured
- [ ] Owner bypass only happens server-side

## CTAs & UX
- [ ] "Start Free Negotiation" and "Upgrade to Pro" are prominent in AuditReport + NegotiationCTA
- [ ] Mobile experience verified (no horizontal scroll, good tap targets)

## Other
- [ ] Custom domain + SSL configured
- [ ] SEO meta tags and sitemap updated
- [ ] Analytics (PostHog / GA) tracking key funnels
- [ ] Legal pages (Privacy, Terms) up to date
- [ ] Support email / contact flow tested

Last updated: Phase 4.5
