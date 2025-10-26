#!/bin/bash

# Migration Validation Script
# This script validates migration files for common issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to validate migration file
validate_migration() {
    local file="$1"
    local filename=$(basename "$file")
    
    print_status "Validating migration: $filename"
    
    local errors=0
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        print_error "Migration file not found: $file"
        return 1
    fi
    
    # Check file naming convention
    if [[ ! "$filename" =~ ^[0-9]{14}_.*\.sql$ ]]; then
        print_error "Invalid migration filename format: $filename"
        print_error "Expected format: YYYYMMDDHHMMSS_description.sql"
        errors=$((errors + 1))
    fi
    
    # Check for common SQL issues
    local content=$(cat "$file")
    
    # Check for missing semicolons
    if echo "$content" | grep -q "CREATE TABLE.*[^;]$"; then
        print_warning "Missing semicolon after CREATE TABLE statement"
    fi
    
    # Check for RLS policies
    if echo "$content" | grep -q "CREATE TABLE" && ! echo "$content" | grep -q "ENABLE ROW LEVEL SECURITY"; then
        print_warning "Table created without RLS enabled"
    fi
    
    # Check for audit triggers
    if echo "$content" | grep -q "CREATE TABLE" && ! echo "$content" | grep -q "audit_trigger_function"; then
        print_warning "Table created without audit trigger"
    fi
    
    # Check for proper indexes
    if echo "$content" | grep -q "CREATE TABLE" && ! echo "$content" | grep -q "CREATE INDEX"; then
        print_warning "Table created without indexes"
    fi
    
    # Check for foreign key constraints
    if echo "$content" | grep -q "CREATE TABLE" && ! echo "$content" | grep -q "REFERENCES"; then
        print_warning "Table created without foreign key constraints"
    fi
    
    # Check for proper UUID usage
    if echo "$content" | grep -q "CREATE TABLE" && ! echo "$content" | grep -q "uuid_generate_v4"; then
        print_warning "Table created without UUID primary key"
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Migration validation passed: $filename"
        return 0
    else
        print_error "Migration validation failed: $filename ($errors errors)"
        return 1
    fi
}

# Function to validate all migrations
validate_all_migrations() {
    local migrations_dir="supabase/migrations"
    local total_files=0
    local passed_files=0
    
    print_status "Validating all migration files..."
    
    if [ ! -d "$migrations_dir" ]; then
        print_error "Migrations directory not found: $migrations_dir"
        return 1
    fi
    
    for file in "$migrations_dir"/*.sql; do
        if [ -f "$file" ]; then
            total_files=$((total_files + 1))
            if validate_migration "$file"; then
                passed_files=$((passed_files + 1))
            fi
        fi
    done
    
    echo ""
    print_status "Validation Summary:"
    echo "  Total files: $total_files"
    echo "  Passed: $passed_files"
    echo "  Failed: $((total_files - passed_files))"
    
    if [ $passed_files -eq $total_files ]; then
        print_success "All migrations validated successfully!"
        return 0
    else
        print_error "Some migrations failed validation"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Migration Validation Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [FILE]"
    echo ""
    echo "Options:"
    echo "  --all, -a    Validate all migration files"
    echo "  --help, -h   Show this help message"
    echo ""
    echo "Arguments:"
    echo "  FILE         Specific migration file to validate"
    echo ""
    echo "Examples:"
    echo "  $0 --all"
    echo "  $0 supabase/migrations/20251026013249_initial_schema.sql"
}

# Main script logic
main() {
    case "${1:-}" in
        --all|-a)
            validate_all_migrations
            ;;
        --help|-h)
            show_help
            ;;
        "")
            validate_all_migrations
            ;;
        *)
            if [ -f "$1" ]; then
                validate_migration "$1"
            else
                print_error "File not found: $1"
                show_help
                exit 1
            fi
            ;;
    esac
}

# Run main function with all arguments
main "$@"
