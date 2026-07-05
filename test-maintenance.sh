#!/bin/bash

# DHACK'26 Maintenance Mode Test Script
# Usage: ./test-maintenance.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_TOKEN="dhack-admin-2025"
BYPASS_CODE="dhack2025"

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

# Function to test maintenance bypass API
test_bypass_api() {
    print_status "Testing maintenance bypass API..."

    # Test invalid code
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/maintenance-bypass" \
        -H "Content-Type: application/json" \
        -d '{"code":"invalid"}')

    if [ "$response" = "401" ]; then
        print_success "Invalid code correctly rejected"
    else
        print_error "Invalid code test failed (expected 401, got $response)"
    fi

    # Test valid code
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/maintenance-bypass" \
        -H "Content-Type: application/json" \
        -d "{\"code\":\"$BYPASS_CODE\"}")

    if [ "$response" = "200" ]; then
        print_success "Valid bypass code accepted"
    else
        print_error "Valid code test failed (expected 200, got $response)"
    fi
}

# Function to test admin maintenance API
test_admin_api() {
    print_status "Testing admin maintenance API..."

    # Test without auth
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/admin/maintenance")

    if [ "$response" = "401" ]; then
        print_success "Unauthorized access correctly blocked"
    else
        print_error "Auth test failed (expected 401, got $response)"
    fi

    # Test with invalid token
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/admin/maintenance" \
        -H "Authorization: Bearer invalid")

    if [ "$response" = "403" ]; then
        print_success "Invalid token correctly rejected"
    else
        print_error "Invalid token test failed (expected 403, got $response)"
    fi

    # Test with valid token
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/admin/maintenance" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    if [ "$response" = "200" ]; then
        print_success "Admin API accessible with valid token"
    else
        print_error "Valid token test failed (expected 200, got $response)"
    fi
}

# Function to test maintenance page access
test_maintenance_page() {
    print_status "Testing maintenance page access..."

    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/maintenance")

    if [ "$response" = "200" ]; then
        print_success "Maintenance page is accessible"
    else
        print_error "Maintenance page test failed (expected 200, got $response)"
    fi
}

# Function to test home page redirection (if maintenance is enabled)
test_home_page() {
    print_status "Testing home page access..."

    response=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/")

    if [ "$response" = "200" ]; then
        print_success "Home page is accessible"
    else
        print_warning "Home page returned $response (might be redirected to maintenance)"
    fi
}

# Function to check if server is running
check_server() {
    print_status "Checking if development server is running..."

    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_success "Development server is running"
        return 0
    else
        print_error "Development server is not running on $BASE_URL"
        print_warning "Please start the server with: npm run dev"
        return 1
    fi
}

# Main test function
run_tests() {
    echo "========================================"
    echo "DHACK'26 Maintenance Mode Test Suite"
    echo "========================================"
    echo ""

    if ! check_server; then
        exit 1
    fi

    echo ""
    test_maintenance_page
    test_bypass_api
    test_admin_api
    test_home_page

    echo ""
    print_success "Test suite completed!"
    echo ""
    print_status "Note: Some tests may fail if maintenance mode is not enabled"
    print_status "Use './maintenance.sh enable' to enable maintenance mode for full testing"
}

# Show help
show_help() {
    echo "DHACK'26 Maintenance Mode Test Script"
    echo ""
    echo "This script tests the maintenance mode functionality."
    echo ""
    echo "Prerequisites:"
    echo "  - Development server running on http://localhost:3000"
    echo "  - Environment variables configured in .env.local"
    echo ""
    echo "Usage: $0"
    echo ""
    echo "The script will test:"
    echo "  - Maintenance page accessibility"
    echo "  - Bypass API functionality"
    echo "  - Admin API authentication"
    echo "  - Home page access/redirection"
}

# Main script logic
case "${1:-run}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "run"|*)
        run_tests
        ;;
esac
