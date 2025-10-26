# Environment Setup Guide

This guide will help you set up the environment variables needed for the Makerly SaaS monorepo.

## Quick Setup

Run the automated setup script:

```bash
pnpm setup:env
```

This will prompt you for the required environment variables and create `.env` files for both web and marketing applications.

## Manual Setup

If you prefer to set up environment variables manually, follow these steps:

### 1. Create Environment Files

Copy the example files and fill in your values:

```bash
# For web application
cp web/env.example web/.env

# For marketing application  
cp marketing/env.example marketing/.env
```

### 2. Required Environment Variables

#### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep this secret!)

#### Optional Configuration
- `PLANSHIP_API_KEY` - Planship API key for plan management
- `PLANSHIP_PRODUCT_ID` - Planship product ID
- `RESEND_API_KEY` - Resend API key for email functionality

### 3. Application URLs
- `NUXT_PUBLIC_APP_URL` - The public URL of your application
  - Web app: `http://localhost:3000`
  - Marketing app: `http://localhost:3001`

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → `SUPABASE_URL`
   - Project API keys → `SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- **Never commit `.env` files to version control**
- The `.env` files are already in `.gitignore`
- Keep your service role key secure - it has admin access to your database
- Use different keys for development and production environments

## Verification

After setting up your environment variables:

1. Test the connection:
   ```bash
   pnpm db:status
   ```

2. Generate TypeScript types:
   ```bash
   pnpm db:types
   ```

3. Start development:
   ```bash
   pnpm dev
   ```

## Troubleshooting

### Common Issues

1. **"Missing supabase url" warning**
   - Check that `SUPABASE_URL` is set correctly in your `.env` file
   - Ensure the URL format is `https://your-project.supabase.co`

2. **"Missing supabase publishable key" warning**
   - Check that `SUPABASE_ANON_KEY` is set correctly
   - Ensure you're using the anon/public key, not the service role key

3. **Database connection errors**
   - Verify your Supabase project is active
   - Check that your API keys are correct
   - Ensure your project allows connections from your IP

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the project's [Supabase README](../supabase/README.md)
- Open an issue in the project repository
