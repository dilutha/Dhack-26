#!/bin/bash

# DHACK'26 Maintenance Mode Management Script
# Usage: ./maintenance.sh [enable|disable|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.local"
BACKUP_FILE=".env.local.backup"

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

# Function to backup environment file
backup_env() {
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$BACKUP_FILE"
        print_status "Environment file backed up to $BACKUP_FILE"
    fi
}

# Function to enable maintenance mode
enable_maintenance() {
    print_status "Enabling maintenance mode..."

    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi

    backup_env

    # Update or add maintenance mode variable
    if grep -q "NEXT_PUBLIC_MAINTENANCE_MODE" "$ENV_FILE"; then
        sed -i.bak 's/NEXT_PUBLIC_MAINTENANCE_MODE=.*/NEXT_PUBLIC_MAINTENANCE_MODE=true/' "$ENV_FILE"
    else
        echo "NEXT_PUBLIC_MAINTENANCE_MODE=true" >> "$ENV_FILE"
    fi

    print_success "Maintenance mode enabled"
    print_warning "Remember to restart your development server or redeploy for changes to take effect"
}

# Function to disable maintenance mode
disable_maintenance() {
    print_status "Disabling maintenance mode..."

    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi

    backup_env

    # Update or add maintenance mode variable
    if grep -q "NEXT_PUBLIC_MAINTENANCE_MODE" "$ENV_FILE"; then
        sed -i.bak 's/NEXT_PUBLIC_MAINTENANCE_MODE=.*/NEXT_PUBLIC_MAINTENANCE_MODE=false/' "$ENV_FILE"
    else
        echo "NEXT_PUBLIC_MAINTENANCE_MODE=false" >> "$ENV_FILE"
    fi

    print_success "Maintenance mode disabled"
    print_warning "Remember to restart your development server or redeploy for changes to take effect"
}

# Function to show maintenance status
show_status() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi

    if grep -q "NEXT_PUBLIC_MAINTENANCE_MODE=true" "$ENV_FILE"; then
        print_warning "Maintenance mode is currently ENABLED"
    else
        print_success "Maintenance mode is currently DISABLED"
    fi

    echo ""
    print_status "Current configuration:"
    echo "------------------------"

    if grep -q "MAINTENANCE_BYPASS_CODES" "$ENV_FILE"; then
        bypass_count=$(grep "MAINTENANCE_BYPASS_CODES" "$ENV_FILE" | cut -d'=' -f2 | tr ',' '\n' | wc -l)
        echo "Bypass codes configured: $bypass_count"
    else
        echo "Bypass codes: Not configured"
    fi

    if grep -q "MAINTENANCE_BYPASS_TOKEN" "$ENV_FILE"; then
        echo "Bypass token: Configured"
    else
        echo "Bypass token: Not configured"
    fi

    if grep -q "ADMIN_TOKEN" "$ENV_FILE"; then
        echo "Admin token: Configured"
    else
        echo "Admin token: Not configured"
    fi
}

# Function to show help
show_help() {
    echo "DHACK'26 Maintenance Mode Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  enable   - Enable maintenance mode"
    echo "  disable  - Disable maintenance mode"
    echo "  status   - Show current maintenance status"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 enable"
    echo "  $0 disable"
    echo "  $0 status"
}

# Main script logic
case "${1:-help}" in
    "enable")
        enable_maintenance
        ;;
    "disable")
        disable_maintenance
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
