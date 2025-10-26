#!/bin/bash

# Database Migration Management Script for Makerly SaaS
# This script provides comprehensive database migration capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
}

# Function to check if project is linked
check_project_linked() {
    if [ ! -f "supabase/config.toml" ]; then
        print_error "Supabase project not initialized. Run 'supabase init' first."
        exit 1
    fi
}

# Function to check environment variables
check_env_vars() {
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        print_error "SUPABASE_PROJECT_ID environment variable is not set."
        print_warning "Please run 'pnpm setup:env' or set the environment variable manually."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Database Migration Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  migrate     Apply pending migrations to cloud database"
    echo "  rollback    Rollback last migration (destructive)"
    echo "  reset       Reset database to initial state (destructive)"
    echo "  status      Show migration status"
    echo "  types       Generate TypeScript types from database schema"
    echo "  new         Create a new migration file"
    echo "  diff        Show differences between local and remote schema"
    echo "  link        Link to Supabase project"
    echo "  seed        Reset database and apply seed data"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate"
    echo "  $0 new add_inventory_tables"
    echo "  $0 types"
}

# Function to migrate database
migrate_database() {
    print_status "Applying migrations to cloud database..."
    
    if supabase db push; then
        print_success "Migrations applied successfully!"
        print_status "Generating TypeScript types..."
        if pnpm db:types; then
            print_success "TypeScript types generated successfully!"
        else
            print_warning "Failed to generate TypeScript types. You may need to run 'pnpm db:types' manually."
        fi
    else
        print_error "Migration failed!"
        exit 1
    fi
}

# Function to rollback database
rollback_database() {
    print_warning "This will rollback the last migration. This action cannot be undone!"
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status "Rolling back last migration..."
        if supabase db reset --linked; then
            print_success "Database rolled back successfully!"
        else
            print_error "Rollback failed!"
            exit 1
        fi
    else
        print_status "Rollback cancelled."
    fi
}

# Function to reset database
reset_database() {
    print_warning "This will reset the entire database to its initial state. This action cannot be undone!"
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status "Resetting database..."
        if supabase db reset --linked; then
            print_success "Database reset successfully!"
        else
            print_error "Reset failed!"
            exit 1
        fi
    else
        print_status "Reset cancelled."
    fi
}

# Function to show migration status
show_status() {
    print_status "Checking migration status..."
    supabase migration list
}

# Function to generate TypeScript types
generate_types() {
    print_status "Generating TypeScript types from database schema..."
    
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        print_error "SUPABASE_PROJECT_ID environment variable is not set."
        exit 1
    fi
    
    if supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > shared/src/types/supabase.ts; then
        print_success "TypeScript types generated successfully!"
        print_status "Types saved to: shared/src/types/supabase.ts"
    else
        print_error "Failed to generate TypeScript types!"
        exit 1
    fi
}

# Function to create new migration
create_migration() {
    if [ -z "$1" ]; then
        print_error "Migration name is required."
        echo "Usage: $0 new <migration_name>"
        exit 1
    fi
    
    print_status "Creating new migration: $1"
    
    if supabase migration new "$1"; then
        print_success "Migration created successfully!"
        print_status "Edit the migration file in supabase/migrations/ directory"
    else
        print_error "Failed to create migration!"
        exit 1
    fi
}

# Function to show schema diff
show_diff() {
    print_status "Comparing local and remote schema..."
    supabase db diff
}

# Function to link project
link_project() {
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        print_error "SUPABASE_PROJECT_ID environment variable is not set."
        exit 1
    fi
    
    print_status "Linking to Supabase project: $SUPABASE_PROJECT_ID"
    
    if supabase link --project-ref "$SUPABASE_PROJECT_ID"; then
        print_success "Project linked successfully!"
    else
        print_error "Failed to link project!"
        exit 1
    fi
}

# Function to seed database
seed_database() {
    print_warning "This will reset the database and apply seed data. This action cannot be undone!"
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        print_status "Resetting database and applying seed data..."
        if supabase db reset --linked --seed; then
            print_success "Database seeded successfully!"
        else
            print_error "Seeding failed!"
            exit 1
        fi
    else
        print_status "Seeding cancelled."
    fi
}

# Main script logic
main() {
    # Check prerequisites
    check_supabase_cli
    check_project_linked
    
    # Parse command
    case "${1:-help}" in
        migrate)
            check_env_vars
            migrate_database
            ;;
        rollback)
            check_env_vars
            rollback_database
            ;;
        reset)
            check_env_vars
            reset_database
            ;;
        status)
            show_status
            ;;
        types)
            check_env_vars
            generate_types
            ;;
        new)
            create_migration "$2"
            ;;
        diff)
            check_env_vars
            show_diff
            ;;
        link)
            check_env_vars
            link_project
            ;;
        seed)
            check_env_vars
            seed_database
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
