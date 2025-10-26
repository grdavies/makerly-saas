# Database Migration Workflow

This document describes the database migration system and workflow for the Makerly SaaS platform.

## Overview

The migration system is built on Supabase CLI and provides:
- **Cloud-first development** - Primary development against cloud database
- **Version control** - All schema changes tracked in git
- **Rollback capabilities** - Safe rollback of migrations
- **Type safety** - Automatic TypeScript type generation
- **Audit trail** - Complete history of schema changes

## Available Commands

### Core Migration Commands

```bash
# Apply pending migrations to cloud database
pnpm db:migrate

# Show migration status
pnpm db:status

# Generate TypeScript types from current schema
pnpm db:types

# Create a new migration file
pnpm db:new <migration_name>
```

### Advanced Commands

```bash
# Show differences between local and remote schema
pnpm db:diff

# Link to Supabase project (first-time setup)
pnpm db:link

# Reset database to initial state (DESTRUCTIVE)
pnpm db:reset

# Rollback last migration (DESTRUCTIVE)
pnpm db:rollback

# Reset database and apply seed data (DESTRUCTIVE)
pnpm db:seed
```

### Local Development Commands

```bash
# Start local Supabase instance
pnpm db:start

# Stop local Supabase instance
pnpm db:stop
```

## Migration Workflow

### 1. Creating a New Migration

```bash
# Create a new migration file
pnpm db:new add_inventory_tables

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_inventory_tables.sql
```

### 2. Writing Migration SQL

Edit the generated migration file in `supabase/migrations/`:

```sql
-- Migration: add_inventory_tables
-- Description: Add core inventory management tables

-- Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_version BIGINT DEFAULT 1
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage items in their teams" ON items
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Create indexes
CREATE INDEX idx_items_team_id ON items(team_id);
CREATE INDEX idx_items_sku ON items(sku);

-- Add audit trigger
CREATE TRIGGER audit_items AFTER INSERT OR UPDATE OR DELETE ON items
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 3. Applying Migrations

```bash
# Apply migrations to cloud database
pnpm db:migrate

# This will:
# 1. Push migrations to Supabase
# 2. Generate TypeScript types
# 3. Update shared/src/types/supabase.ts
```

### 4. Verifying Changes

```bash
# Check migration status
pnpm db:status

# Generate types to verify schema
pnpm db:types
```

## Best Practices

### Migration Design

1. **Atomic Changes**: Each migration should be atomic and reversible
2. **Backward Compatibility**: Avoid breaking changes in migrations
3. **Data Safety**: Always backup before destructive operations
4. **Testing**: Test migrations on staging before production

### File Organization

```
supabase/
├── migrations/
│   ├── 20251026013249_initial_schema.sql
│   ├── 20251026014530_add_inventory_tables.sql
│   └── 20251026015215_add_user_preferences.sql
├── seed.sql
├── config.toml
└── SCHEMA.md
```

### Naming Conventions

- **Migration files**: `YYYYMMDDHHMMSS_descriptive_name.sql`
- **Tables**: `snake_case` (e.g., `team_members`)
- **Columns**: `snake_case` (e.g., `created_at`)
- **Indexes**: `idx_tablename_columnname`
- **Policies**: Descriptive names (e.g., `"Users can manage items in their teams"`)

## Environment Setup

### Required Environment Variables

```bash
# Supabase Project Configuration
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### First-Time Setup

```bash
# 1. Set up environment variables
pnpm setup:env

# 2. Link to Supabase project
pnpm db:link

# 3. Apply initial migrations
pnpm db:migrate

# 4. Verify setup
pnpm db:status
```

## Troubleshooting

### Common Issues

1. **"Project not linked" error**
   ```bash
   pnpm db:link
   ```

2. **"Environment variables not set" error**
   ```bash
   pnpm setup:env
   ```

3. **"Migration failed" error**
   - Check SQL syntax in migration file
   - Verify database permissions
   - Check for conflicting changes

4. **"Type generation failed" error**
   - Verify SUPABASE_PROJECT_ID is set
   - Check project permissions
   - Ensure schema is valid

### Recovery Procedures

1. **Rollback Failed Migration**
   ```bash
   pnpm db:rollback
   ```

2. **Reset to Clean State**
   ```bash
   pnpm db:reset
   ```

3. **Reapply All Migrations**
   ```bash
   pnpm db:seed
   ```

## Security Considerations

- **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secure
- **RLS Policies**: Always enable RLS on new tables
- **Audit Logging**: Include audit triggers for sensitive tables
- **Data Validation**: Validate data in migrations when possible

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Database Migration
on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm db:migrate
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Monitoring and Maintenance

- **Regular Backups**: Set up automated database backups
- **Migration Monitoring**: Monitor migration execution times
- **Type Generation**: Keep TypeScript types up to date
- **Schema Documentation**: Update SCHEMA.md with changes
