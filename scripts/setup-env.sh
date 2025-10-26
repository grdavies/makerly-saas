#!/bin/bash

# Environment Setup Script for Makerly SaaS
# This script helps developers set up their environment variables

set -e

echo "🚀 Setting up Makerly SaaS environment variables..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to prompt for environment variable
prompt_env_var() {
    local var_name=$1
    local description=$2
    local default_value=$3
    
    echo -e "${YELLOW}Enter $description:${NC}"
    if [ -n "$default_value" ]; then
        echo -e "${YELLOW}(default: $default_value)${NC}"
    fi
    read -p "$var_name=" value
    
    if [ -z "$value" ] && [ -n "$default_value" ]; then
        value=$default_value
    fi
    
    echo "$value"
}

# Check if .env files already exist
if [ -f "web/.env" ]; then
    echo -e "${YELLOW}Warning: web/.env already exists. Backing up to web/.env.backup${NC}"
    cp web/.env web/.env.backup
fi

if [ -f "marketing/.env" ]; then
    echo -e "${YELLOW}Warning: marketing/.env already exists. Backing up to marketing/.env.backup${NC}"
    cp marketing/.env marketing/.env.backup
fi

echo -e "${GREEN}Please provide the following Supabase configuration:${NC}"

# Get Supabase configuration
SUPABASE_URL=$(prompt_env_var "SUPABASE_URL" "Supabase project URL" "https://ekccedkwvgvggdufhwsv.supabase.co")
SUPABASE_ANON_KEY=$(prompt_env_var "SUPABASE_ANON_KEY" "Supabase anonymous key")
SUPABASE_SERVICE_ROLE_KEY=$(prompt_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key")
SUPABASE_DB_PASSWORD=$(prompt_env_var "SUPABASE_DB_PASSWORD" "Supabase database password" "WZRz5CuU9GOfZwDC")

# Get Planship configuration (optional)
echo -e "${GREEN}Planship configuration (optional, press Enter to skip):${NC}"
PLANSHIP_API_KEY=$(prompt_env_var "PLANSHIP_API_KEY" "Planship API key" "")
PLANSHIP_PRODUCT_ID=$(prompt_env_var "PLANSHIP_PRODUCT_ID" "Planship product ID" "")

# Get Resend configuration (optional)
echo -e "${GREEN}Email configuration (optional, press Enter to skip):${NC}"
RESEND_API_KEY=$(prompt_env_var "RESEND_API_KEY" "Resend API key" "")

# Create web/.env
cat > web/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD

# Planship Configuration
PLANSHIP_API_KEY=$PLANSHIP_API_KEY
PLANSHIP_PRODUCT_ID=$PLANSHIP_PRODUCT_ID

# Email Configuration
RESEND_API_KEY=$RESEND_API_KEY

# Application Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Create marketing/.env
cat > marketing/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD

# Application Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3001
EOF

echo -e "${GREEN}✅ Environment files created successfully!${NC}"
echo -e "${GREEN}📁 Files created:${NC}"
echo "   - web/.env"
echo "   - marketing/.env"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify your Supabase project is set up correctly"
echo "2. Run 'pnpm db:migrate' to apply database migrations"
echo "3. Run 'pnpm db:generate' to generate TypeScript types"
echo "4. Start development with 'pnpm dev'"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"