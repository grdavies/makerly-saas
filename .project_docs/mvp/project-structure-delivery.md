# **Makerly — Project Structure & Delivery**

**Version:** 2025-10-23

## **Monorepo**

* pnpm workspaces; TypeScript strict.  
* Packages: web (Nuxt app), docs (Nuxt UI Docs), marketing (Nuxt UI SaaS), shared (types/utils), emails (vue-email SFCs).

## **Lint/Format/Test**

* ESLint \+ Prettier.  
* Unit: **Vitest**; E2E: **Playwright**; API tests for server routes.

## **CI/CD**

* **GitHub Actions**: lint/test → deploy preview → promote.  
* Branching: **GitFlow** (main, develop, feature/*, release/*).  
* Envs: develop, staging, prod.

## **Secrets & Config**

* Vercel env vars; Supabase secrets; Resend API keys; Sentry DSN.

## **Conventions**

* RFC‑7807 errors; Idempotency-Key; cursor pagination; OData‑like list filters.  
* Composables for plan/limits; composables for i18n t().