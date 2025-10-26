# **Makerly — Tech Stack & Architecture**

**Version:** 2025-10-24

## **Frontend**

* **Nuxt 4 \+ Nuxt UI** (marketing/docs SSG/ISR; app SSR).  
* **pinia \+ pinia-plugin-persisted-state** for state management.  
* **nuxt/image** to manage images.  
* **nuxt/icon** for all application icons  
* **nuxtjs/color-mode** to manage the color mode in use  
* **nuxt-i18n** for localization scaffolding (EN-US at launch).  
* **unovis/vue** for charts; **nuxt/icon** with Lucide set.  
* **nuxt/fonts** managing **Nunito** (display), **Inter** (UI), **JetBrains Mono** (code).  
* marketing pages should follow this template https://github.com/nuxt-ui-templates/landing  
* documentation page should follow this template https://github.com/nuxt-ui-templates/docs  
* application pages should follow this template https://github.com/nuxt-ui-templates/dashboard

## **Backend & Data**

* **Supabase Postgres** using **nuxtjs/supabase** with **Row-Level Security** (multi-tenant) and **Supabase Edge Functions** for business logic (Deno).  
* **Redis (Vercel Marketplace)** as read-through cache and lightweight job queue metadata (ids, dedupe).  
* **Vercel Cron** \+ HTTP webhook fan-out for background work (idempotent, chunked).

## **Email**

* **vue-email** Vue SFC templates rendered in **Nuxt server (Node)**; Resend HTTP API send; DKIM on makerly.app.  
* Internal endpoint `/api/email/send` used by both app and edge functions.

## **Feature Flags & Plans**

* **DB-backed capabilities & limits** (OpenFeature-compatible wrapper).  
* Public **plans matrix** via planShip/nuxt controls the DB capabilities.

## **Observability**

* Structured logs (request\_id, user\_id, team\_id).  
* Error tracking: **Sentry** using **sentry/nuxt**.  
* Audit log table for all write actions.

## **Security**

* 2FA for super-admin; admin UI under separate path.  
* Signed webhooks; HMAC verification; replay UI.  
* Standard idempotency via `Idempotency-Key` on write endpoints.  
* 