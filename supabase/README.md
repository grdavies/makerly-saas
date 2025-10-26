# Supabase Configuration

This directory contains the Supabase configuration for the Makerly SaaS monorepo.

## Multi-Application Architecture

Both the **web application** (dashboard) and **marketing application** (landing page) are configured to use Supabase:

- **Web App**: Full Supabase integration with authentication, database access, and real-time features
- **Marketing App**: Supabase integration for authentication, user registration, and basic data display
- **Docs App**: No Supabase integration (static documentation only)

## Cloud-First Development Approach

This project is configured for cloud-first development, meaning:
- Primary development happens against a cloud Supabase project
- Local development is optional and used only when needed
- All migrations are designed to work with cloud Supabase

## Directory Structure

- `config.toml` - Supabase CLI configuration
- `migrations/` - Database migration files
- `seed.sql` - Initial seed data
- `functions/` - Edge functions (if needed)

## Environment Variables

The following environment variables are required:

```bash
# Supabase Project Configuration
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For local development
SUPABASE_DB_PASSWORD=your-db-password
```

## Commands

- `pnpm db:generate` - Generate TypeScript types from database schema
- `pnpm db:migrate` - Apply migrations to cloud database
- `pnpm db:rollback` - Rollback last migration
- `pnpm db:reset` - Reset database (development only)

## Migration Workflow

1. Create migration: `supabase migration new migration_name`
2. Write SQL in the generated migration file
3. Apply to cloud: `pnpm db:migrate`
4. Generate types: `pnpm db:generate`
5. Test in application

## Security

- All tables use Row-Level Security (RLS)
- Multi-tenant isolation is enforced at the database level
- Audit logging is implemented for all critical operations
