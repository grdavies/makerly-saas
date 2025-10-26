# **0001-PRD: Makerly Monorepo Initialization**

**Version:** 2025-01-27  
**Status:** Draft

## **1. Introduction/Overview**

This PRD defines the initialization and setup of the Makerly monorepo, establishing the foundational infrastructure for a SaaS inventory management application. The goal is to create a production-ready development environment with Nuxt 4, Supabase integration, custom RBAC, I18N infrastructure, and plan management capabilities.

The monorepo will support multiple applications (web app, documentation, marketing site) with shared types and utilities, following modern development practices with comprehensive testing, linting, and CI/CD capabilities.

## **2. Goals**

1. **Establish Monorepo Structure**: Create a pnpm workspace with proper package organization and TypeScript strict mode
2. **Nuxt 4 Foundation**: Initialize all Nuxt applications with required modules and configurations
3. **Supabase Integration**: Set up cloud-first database connection with migration system and authentication
4. **Custom RBAC System**: Implement role-based access control with 2FA for super-admin users
5. **I18N Infrastructure**: Create English-first internationalization with currency, date, and unit formatting
6. **Plan Management**: Integrate Planship for subscription and feature gating with RFC-7807 error handling
7. **Development Environment**: Establish comprehensive linting, testing, formatting, and email systems
8. **Template Integration**: Configure Nuxt UI templates for dashboard, docs, and marketing applications

## **3. User Stories**

**As a developer**, I want a well-structured monorepo so that I can efficiently develop multiple applications with shared code.

**As a developer**, I want automated database migrations so that I can safely deploy schema changes across environments.

**As an admin user**, I want custom role management so that I can control access to different features and locations.

**As a team admin**, I want to configure I18N settings so that my team can work with their preferred currency, date formats, and units.

**As a user**, I want clear plan limit messaging so that I understand my current usage and upgrade options.

**As a developer**, I want comprehensive testing and linting so that I can maintain code quality and catch issues early.

## **4. Functional Requirements**

### **4.1 Monorepo Structure**
1. The system must use pnpm workspaces with the following packages:
   - `web` (Nuxt 4 main application)
   - `docs` (Nuxt UI Docs template)
   - `marketing` (Nuxt UI SaaS template)
   - `shared` (TypeScript types and utilities)
   - `emails` (vue-email SFC templates)

2. The system must include a root `package.json` with workspace configuration and shared dependencies.

3. Each package must have its own `.npmrc` file with `shamefully-hoist=true`.

4. The system must use TypeScript strict mode across all packages.

### **4.2 Nuxt 4 Configuration**
5. The system must use Nuxt 4 for all applications with the following modules:
   - `@nuxt/ui` for UI components
   - `@nuxtjs/supabase` for database integration
   - `@nuxt/image` for image management
   - `@nuxt/icon` for application icons
   - `@nuxtjs/color-mode` for theme management
   - `@nuxtjs/i18n` for internationalization
   - `@nuxt/fonts` for font management (Nunito, Inter, JetBrains Mono)
   - `@planship/nuxt` for plan management
   - `vite-tsconfig-paths` for path resolution

6. The system must configure each application type appropriately:
   - Web app: SSR mode with dashboard template
   - Docs: SSG mode with documentation template
   - Marketing: SSG/ISR mode with landing page template

### **4.3 Supabase Integration**
7. The system must establish cloud-first Supabase connection with proper environment variable configuration.

8. The system must implement a migration system using Supabase CLI with:
   - Migration file organization
   - Environment-specific migration execution
   - Rollback capabilities
   - Migration status tracking

9. The system must set up Row-Level Security (RLS) policies for multi-tenant isolation.

10. The system must implement audit logging for all write operations with:
    - User identification
    - Action tracking
    - Entity changes
    - Timestamp recording

### **4.4 Authentication & RBAC**
11. The system must implement Supabase authentication with:
    - Email/password authentication
    - Email confirmation flow
    - Password reset functionality

12. The system must create custom RBAC tables:
    - `users` with team association
    - `teams` with I18N configuration
    - `team_members` with role assignment
    - `roles` with custom permission definitions
    - `role_permissions` with action/resource/location scoping

13. The system must implement 2FA for super-admin users using Supabase Auth.

14. The system must create composables for:
    - User authentication state
    - Permission checking
    - Role management

### **4.5 I18N Infrastructure**
15. The system must create I18N database tables:
    - Team-level configuration (base_currency_code, default_unit_family, date_format, time_format)
    - User-level overrides (override_unit_family, override_date_format, override_time_format)

16. The system must implement I18N composables for:
    - Currency formatting
    - Date/time formatting
    - Unit conversion
    - Translation functions

17. The system must support English (EN-US) as the primary language with infrastructure for future expansion.

### **4.6 Plan Management**
18. The system must integrate Planship for subscription management with:
    - Plan capability definitions
    - Usage tracking
    - Grace window management
    - Upgrade/downgrade flows

19. The system must implement RFC-7807 compliant error responses for plan limits with fields:
    - `code`, `feature_id`, `limit`, `used`, `remaining`
    - `grace.active`, `grace.expires_at`
    - `upgrade_url`, `user_message`

20. The system must create plan gates composables for:
    - Feature access checking
    - Usage monitoring
    - Upgrade prompts

### **4.7 Development Environment**
21. The system must configure ESLint and Prettier with:
    - Nuxt-specific rules
    - TypeScript integration
    - Pre-commit hooks

22. The system must set up testing infrastructure with:
    - Vitest for unit testing
    - Playwright for E2E testing
    - API testing for server routes

23. The system must implement email system with:
    - vue-email SFC templates
    - Resend API integration
    - Internal email sending endpoint

24. The system must configure GitFlow branching strategy with:
    - main, develop, feature/*, release/* branches
    - GitHub Actions CI/CD pipeline

## **5. Non-Goals (Out of Scope)**

- Redis integration (deferred to later phase)
- Multi-language support beyond English infrastructure
- Advanced reporting features
- AI/LLM integration
- Third-party sales channel integrations
- Advanced analytics and monitoring beyond basic error tracking

## **6. Design Considerations**

- **Template Usage**: 
  - Dashboard template for main web application
  - Documentation template for docs application
  - Landing page template for marketing application
- **UI Framework**: Nuxt UI components with consistent design system
- **Theme**: Support for light/dark mode with color-mode module
- **Responsive Design**: Mobile-first approach with Nuxt UI responsive utilities

## **7. Technical Considerations**

- **Database**: Supabase Postgres with cloud-first approach
- **Authentication**: Supabase Auth with custom RBAC layer
- **State Management**: Pinia with persisted state plugin
- **Charts**: Unovis/vue for data visualization
- **Error Tracking**: Sentry integration for production monitoring
- **Email**: Resend API with DKIM configuration
- **Path Resolution**: vite-tsconfig-paths for proper TypeScript path mapping
- **Package Management**: pnpm with shamefully-hoist for Nuxt compatibility

## **8. Success Metrics**

- All applications build successfully without errors
- Database migrations can be executed and rolled back
- Authentication flow works end-to-end
- RBAC system allows proper permission checking
- I18N composables format currency, dates, and units correctly
- Plan gates properly restrict features and show upgrade prompts
- All tests pass (unit and E2E)
- Linting and formatting rules are enforced
- Email system can send test emails successfully

## **9. Open Questions**

- Should we include Sentry configuration in this PRD or defer to a later phase?
- Do we need to set up staging environment configuration in this initial phase?
- Should we include basic CI/CD pipeline setup or focus on local development environment?
- Do we need to configure domain-specific email templates in this phase?

## **10. Dependencies**

- Supabase project setup and API keys
- Planship account and API configuration
- Resend API key for email functionality
- GitHub repository with proper branch protection rules
- Vercel account for deployment (if including CI/CD)

## **11. Implementation Phases**

1. **Phase 1**: Monorepo structure and package configuration
2. **Phase 2**: Nuxt 4 applications with templates
3. **Phase 3**: Supabase integration and migration system
4. **Phase 4**: Authentication and RBAC implementation
5. **Phase 5**: I18N infrastructure and composables
6. **Phase 6**: Planship integration and plan gates
7. **Phase 7**: Development environment and testing setup
8. **Phase 8**: Email system and final integration testing
