# **Tasks: Makerly Monorepo Initialization**

**Based on:** 0001-prd-monorepo-initialization.md  
**Generated:** 2025-01-27

## **Relevant Files**

### **Root Configuration**
- `package.json` - Root workspace configuration with pnpm workspaces and shared dependencies
- `pnpm-workspace.yaml` - pnpm workspace configuration file
- `tsconfig.json` - Root TypeScript configuration with strict mode
- `.npmrc` - Root npm configuration with shamefully-hoist setting
- `.gitignore` - Git ignore patterns for monorepo
- `.editorconfig` - Editor configuration for consistent formatting

### **Web Application (Main)**
- `web/package.json` - Web app dependencies and scripts
- `web/nuxt.config.ts` - Nuxt 4 configuration for main application
- `web/.npmrc` - Package-specific npm configuration
- `web/app.vue` - Root Vue component
- `web/composables/useAuth.ts` - Authentication composable
- `web/composables/useRBAC.ts` - Role-based access control composable
- `web/composables/useI18n.ts` - Internationalization composable
- `web/composables/usePlanGates.ts` - Plan management composable
- `web/server/api/auth/[...].ts` - Authentication API routes
- `web/server/api/email/send.ts` - Email sending endpoint

### **Documentation Application**
- `docs/package.json` - Docs app dependencies and scripts
- `docs/nuxt.config.ts` - Nuxt 4 configuration for documentation
- `docs/.npmrc` - Package-specific npm configuration
- `docs/app.vue` - Root Vue component for docs

### **Marketing Application**
- `marketing/package.json` - Marketing app dependencies and scripts
- `marketing/nuxt.config.ts` - Nuxt 4 configuration for marketing site
- `marketing/.npmrc` - Package-specific npm configuration
- `marketing/app.vue` - Root Vue component for marketing

### **Shared Package**
- `shared/package.json` - Shared package dependencies and scripts
- `shared/src/types/index.ts` - Shared TypeScript type definitions
- `shared/src/utils/index.ts` - Shared utility functions
- `shared/src/constants/index.ts` - Shared constants and enums

### **Email Package**
- `emails/package.json` - Email package dependencies and scripts
- `emails/src/templates/welcome.vue` - Welcome email template
- `emails/src/templates/password-reset.vue` - Password reset email template
- `emails/src/templates/invitation.vue` - Team invitation email template

### **Database & Migrations**
- `supabase/config.toml` - Supabase project configuration
- `supabase/migrations/001_initial_schema.sql` - Initial database schema migration
- `supabase/migrations/002_auth_rbac.sql` - Authentication and RBAC tables
- `supabase/migrations/003_i18n_config.sql` - I18N configuration tables
- `supabase/migrations/004_audit_logging.sql` - Audit logging system
- `supabase/seed.sql` - Database seed data

### **Development Environment**
- `.eslintrc.js` - ESLint configuration with Nuxt rules
- `.prettierrc` - Prettier formatting configuration
- `vitest.config.ts` - Vitest unit testing configuration
- `playwright.config.ts` - Playwright E2E testing configuration
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline

### **Environment Configuration**
- `.env.example` - Environment variables template
- `.env.local` - Local development environment variables
- `web/.env.example` - Web app environment variables template

### **Test Files**
- `web/composables/useAuth.test.ts` - Unit tests for authentication composable
- `web/composables/useRBAC.test.ts` - Unit tests for RBAC composable
- `web/composables/useI18n.test.ts` - Unit tests for I18N composable
- `web/composables/usePlanGates.test.ts` - Unit tests for plan gates composable
- `web/server/api/auth/[...].test.ts` - API tests for authentication routes
- `web/server/api/email/send.test.ts` - API tests for email endpoint
- `shared/src/utils/index.test.ts` - Unit tests for shared utilities
- `e2e/auth.spec.ts` - E2E tests for authentication flow
- `e2e/rbac.spec.ts` - E2E tests for RBAC functionality

### **Notes**

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test` to run all tests, `pnpm test:unit` for unit tests, and `pnpm test:e2e` for E2E tests.
- Database migrations should be run using `pnpm db:migrate` and can be rolled back with `pnpm db:rollback`.
- Each Nuxt application should be independently buildable and deployable.

## **Tasks**

- [x] 1.0 Establish Monorepo Structure
  - [x] 1.1 Create root package.json with pnpm workspace configuration
  - [x] 1.2 Set up pnpm-workspace.yaml with all required packages
  - [x] 1.3 Configure root TypeScript with strict mode and path mapping
  - [x] 1.4 Create .npmrc files with shamefully-hoist=true for each package
  - [x] 1.5 Set up .gitignore and .editorconfig for monorepo
  - [x] 1.6 Initialize shared package with TypeScript types and utilities

- [ ] 2.0 Initialize Nuxt 4 Applications
  - [x] 2.1 Create web application with Nuxt 4 and required modules
  - [x] 2.2 Configure web app with dashboard template and SSR mode
  - [x] 2.3 Create docs application with Nuxt UI Docs template and SSG mode
  - [x] 2.4 Create marketing application with Nuxt UI SaaS template and SSG/ISR mode
  - [x] 2.5 Install and configure all required Nuxt modules (@nuxt/ui, @nuxtjs/supabase, @nuxt/image, @nuxt/icon, @nuxtjs/color-mode, @nuxtjs/i18n, @nuxt/fonts, @planship/nuxt)
  - [x] 2.6 Configure vite-tsconfig-paths for proper TypeScript path resolution
  - [x] 2.7 Set up fonts (Nunito, Inter, JetBrains Mono) across all applications

- [ ] 3.0 Configure Supabase Integration
  - [ ] 3.1 Initialize Supabase project with cloud-first configuration
  - [ ] 3.2 Set up environment variables for Supabase connection
  - [ ] 3.3 Create initial database schema migration with core tables
  - [ ] 3.4 Implement migration system with CLI commands and rollback capabilities
  - [ ] 3.5 Set up Row-Level Security (RLS) policies for multi-tenant isolation
  - [ ] 3.6 Create audit logging system with triggers and tables
  - [ ] 3.7 Configure Supabase client in Nuxt applications

- [ ] 4.0 Implement Authentication & RBAC
  - [ ] 4.1 Set up Supabase authentication with email/password and confirmation flow
  - [ ] 4.2 Create users table with team association
  - [ ] 4.3 Create teams table with I18N configuration fields
  - [ ] 4.4 Create team_members table with role assignment
  - [ ] 4.5 Create roles table with custom permission definitions
  - [ ] 4.6 Create role_permissions table with action/resource/location scoping
  - [ ] 4.7 Implement 2FA for super-admin users using Supabase Auth
  - [ ] 4.8 Create useAuth composable for authentication state management
  - [ ] 4.9 Create useRBAC composable for permission checking and role management
  - [ ] 4.10 Create authentication API routes for login, logout, and password reset

- [ ] 5.0 Build I18N Infrastructure
  - [ ] 5.1 Create I18N database tables for team and user configuration
  - [ ] 5.2 Set up @nuxtjs/i18n with English (EN-US) as primary language
  - [ ] 5.3 Create useI18n composable for translation functions
  - [ ] 5.4 Implement currency formatting composable with team base currency
  - [ ] 5.5 Implement date/time formatting composable with user overrides
  - [ ] 5.6 Implement unit conversion composable with unit families
  - [ ] 5.7 Create I18N configuration API endpoints for team and user settings

- [ ] 6.0 Integrate Planship & Plan Gates
  - [ ] 6.1 Set up Planship account and configure API keys
  - [ ] 6.2 Install and configure @planship/nuxt module
  - [ ] 6.3 Create plan capability definitions in database
  - [ ] 6.4 Implement usage tracking system with rolling windows
  - [ ] 6.5 Create grace window management for plan limits
  - [ ] 6.6 Implement RFC-7807 compliant error responses for plan limits
  - [ ] 6.7 Create usePlanGates composable for feature access checking
  - [ ] 6.8 Implement upgrade/downgrade flows with Planship integration
  - [ ] 6.9 Create plan gates UI components for upgrade prompts

- [ ] 7.0 Setup Development Environment
  - [ ] 7.1 Configure ESLint with Nuxt-specific rules and TypeScript integration
  - [ ] 7.2 Configure Prettier for consistent code formatting
  - [ ] 7.3 Set up Vitest for unit testing with proper configuration
  - [ ] 7.4 Set up Playwright for E2E testing with proper configuration
  - [ ] 7.5 Configure pre-commit hooks for linting and formatting
  - [ ] 7.6 Set up vue-email with SFC templates for welcome, password reset, and invitation emails
  - [ ] 7.7 Configure Resend API integration for email sending
  - [ ] 7.8 Create internal email sending endpoint (/api/email/send)
  - [ ] 7.9 Set up GitHub Actions CI/CD pipeline with lint, test, and deploy stages

- [ ] 8.0 Finalize Integration & Testing
  - [ ] 8.1 Create comprehensive unit tests for all composables
  - [ ] 8.2 Create API tests for authentication and email endpoints
  - [ ] 8.3 Create E2E tests for authentication flow and RBAC functionality
  - [ ] 8.4 Test database migrations and rollback procedures
  - [ ] 8.5 Test I18N composables with various currency, date, and unit formats
  - [ ] 8.6 Test plan gates with different subscription levels and usage scenarios
  - [ ] 8.7 Verify all applications build successfully without errors
  - [ ] 8.8 Create comprehensive documentation for setup and development workflow
  - [ ] 8.9 Perform end-to-end integration testing of all systems
