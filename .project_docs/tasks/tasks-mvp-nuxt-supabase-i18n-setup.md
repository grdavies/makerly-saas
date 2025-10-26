# Tasks: MVP Nuxt 4 Setup with Supabase, Auth, and I18N Configuration

## Relevant Files

- `package.json` - Project dependencies and workspace configuration
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `apps/web/nuxt.config.ts` - Nuxt 4 application configuration
- `apps/web/package.json` - Web app dependencies
- `apps/docs/nuxt.config.ts` - Documentation app configuration
- `apps/marketing/nuxt.config.ts` - Marketing site configuration
- `packages/shared/package.json` - Shared types and utilities
- `packages/emails/package.json` - Email templates package
- `apps/web/composables/useAuth.ts` - Authentication composable
- `apps/web/composables/useI18n.ts` - I18N configuration composable
- `apps/web/composables/usePlanGates.ts` - RFC-7807 plan gates composable
- `apps/web/server/api/email/send.post.ts` - Email sending endpoint
- `apps/web/types/database.ts` - Supabase database types
- `apps/web/types/plan-gates.ts` - RFC-7807 plan gate types
- `supabase/migrations/001_initial_schema.sql` - Initial database schema
- `supabase/migrations/002_teams_i18n_config.sql` - Teams I18N configuration
- `supabase/migrations/003_users_i18n_overrides.sql` - Users I18N overrides
- `supabase/migrations/004_plans_capabilities.sql` - Plans and capabilities schema
- `apps/web/.env.example` - Environment variables template
- `apps/web/.env.local` - Local environment configuration

### Notes

- This is a monorepo setup with pnpm workspaces
- Each app (web, docs, marketing) will have its own Nuxt configuration
- Shared types and utilities will be in the packages/shared workspace
- Email templates will be in packages/emails using vue-email
- Database migrations will be in the supabase/migrations directory
- All composables follow Nuxt 4 conventions and use TypeScript

## Tasks

- [ ] 1.0 Initialize Monorepo Structure and Dependencies
  - [ ] 1.1 Create root package.json with pnpm workspace configuration
  - [ ] 1.2 Setup pnpm-workspace.yaml with apps/ and packages/ directories
  - [ ] 1.3 Create apps/web/, apps/docs/, apps/marketing/, packages/shared/, packages/emails/ directories
  - [ ] 1.4 Configure TypeScript strict mode and ESLint + Prettier for monorepo
  - [ ] 1.5 Setup Vitest for unit testing and Playwright for E2E testing
  - [ ] 1.6 Configure GitHub Actions CI/CD pipeline with lint/test → deploy preview → promote
- [ ] 2.0 Setup Nuxt 4 Applications (Web, Docs, Marketing)
  - [ ] 2.1 Create apps/web/ Nuxt 4 app with SSR configuration
  - [ ] 2.2 Create apps/docs/ Nuxt 4 app with SSG/ISR configuration following docs template
  - [ ] 2.3 Create apps/marketing/ Nuxt 4 app with SSG/ISR configuration following landing template
  - [ ] 2.4 Configure Nuxt UI for all three applications
  - [ ] 2.5 Setup nuxt/image, nuxt/icon, nuxtjs/color-mode, nuxt-i18n, nuxt/fonts for web app
  - [ ] 2.6 Configure unovis/vue for charts and nuxt/icon with Lucide set
  - [ ] 2.7 Setup pinia + pinia-plugin-persisted-state for state management
- [ ] 3.0 Configure Supabase Integration and Database Schema
  - [ ] 3.1 Initialize Supabase project and configure nuxtjs/supabase module
  - [ ] 3.2 Create initial database schema with tenancy (team_id on all rows)
  - [ ] 3.3 Implement Row-Level Security (RLS) policies for multi-tenant isolation
  - [ ] 3.4 Create teams table with I18N configuration fields (base_currency_code, default_unit_family, date_format, time_format)
  - [ ] 3.5 Create users table with I18N override fields (override_unit_family, override_date_format, override_time_format)
  - [ ] 3.6 Setup plans, capabilities, plan_capabilities, grace_windows tables
  - [ ] 3.7 Generate TypeScript types from Supabase schema
  - [ ] 3.8 Configure Redis (Vercel Marketplace) for read-through cache
- [ ] 4.0 Implement Authentication with sidebase/nuxt-auth
  - [ ] 4.1 Install and configure sidebase/nuxt-auth module
  - [ ] 4.2 Setup Supabase Auth integration with team-based access control
  - [ ] 4.3 Create useAuth composable with team context and user management
  - [ ] 4.4 Implement team invitation system with email notifications
  - [ ] 4.5 Setup custom RBAC with roles, permissions, and location scoping
  - [ ] 4.6 Configure 2FA for super-admin users
  - [ ] 4.7 Implement audit logging for all write actions
- [ ] 5.0 Setup I18N Configuration System (Teams/Users)
  - [ ] 5.1 Create useI18n composable for team and user I18N configuration
  - [ ] 5.2 Implement currency formatting with team base currency and multi-currency display
  - [ ] 5.3 Setup date/time formatting with team defaults and user overrides
  - [ ] 5.4 Configure unit family handling (metric/imperial) with nested UoM support
  - [ ] 5.5 Create I18N settings pages for team admins and user preferences
  - [ ] 5.6 Implement locale-aware number formatting and currency conversion
  - [ ] 5.7 Setup unit conversion utilities for mass, volume, count, length, area, temperature
- [ ] 6.0 Build RFC-7807 Plan Gates and Messaging System
  - [ ] 6.1 Create RFC-7807 compliant error response types and interfaces
  - [ ] 6.2 Implement usePlanGates composable for feature gating and limits
  - [ ] 6.3 Create global plan status banner component with grace/over-limit states
  - [ ] 6.4 Build inline per-feature messaging components with CTAs
  - [ ] 6.5 Setup planShip/nuxt integration for plan matrix and capabilities
  - [ ] 6.6 Implement usage counters with rolling windows and grace periods
  - [ ] 6.7 Create upgrade flow with immediate capability application
  - [ ] 6.8 Setup Vercel Cron for background usage counter recalculation
