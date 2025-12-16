#!/bin/bash

# Comprehensive Testing Script
# This script helps you test all modules before production deployment

set -e

echo "🧪 Gram Panchayat - Comprehensive Testing Guide"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to mark test result
mark_test() {
    local test_name=$1
    local status=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" == "pass" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓${NC} $test_name"
    elif [ "$status" == "fail" ]; then
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗${NC} $test_name"
    else
        echo -e "${YELLOW}⊘${NC} $test_name (Skipped)"
    fi
}

# Check if dev server is running
check_dev_server() {
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Development server is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Development server is NOT running${NC}"
        echo "Please start it with: npm run dev"
        return 1
    fi
}

echo -e "${BLUE}Step 1: Pre-Test Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if dev server is running
if ! check_dev_server; then
    read -p "Start development server now? (y/n): " start_server
    if [ "$start_server" == "y" ]; then
        echo "Starting development server..."
        gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" 2>/dev/null || \
        xterm -e "cd $(pwd) && npm run dev" 2>/dev/null || \
        echo "Please start the server manually with: npm run dev"
        echo "Waiting 10 seconds for server to start..."
        sleep 10
    else
        echo "Please start the server and run this script again"
        exit 1
    fi
fi

echo ""
echo "📋 Testing will cover:"
echo "  • 15 Admin Modules"
echo "  • 7 Public Pages"
echo "  • Authentication Flow"
echo "  • Multi-tenant Isolation"
echo "  • File Operations"
echo ""

read -p "Press Enter to begin testing..."
clear

# ============================================================================
# SECTION 1: AUTHENTICATION TESTING
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 1: Authentication Testing${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "1. Open http://localhost:5173 in your browser"
echo "2. You should see the homepage"
echo ""
read -p "Can you see the homepage? (y/n): " homepage_visible
mark_test "Homepage loads correctly" $([ "$homepage_visible" == "y" ] && echo "pass" || echo "fail")

echo ""
echo "3. Click on 'Admin Login' or navigate to /login"
echo "4. Enter credentials:"
echo "   Email: admin@pindkepar.gov.in"
echo "   Password: admin123"
echo "5. Click 'Sign In'"
echo ""
read -p "Did login succeed? (y/n): " login_success
mark_test "Admin login works" $([ "$login_success" == "y" ] && echo "pass" || echo "fail")

if [ "$login_success" != "y" ]; then
    echo -e "${RED}❌ Login failed. Cannot continue testing.${NC}"
    echo "Please check:"
    echo "  • Firebase Authentication is enabled"
    echo "  • Admin user exists in Firebase Auth"
    echo "  • Credentials are correct"
    exit 1
fi

echo ""
read -p "Were you redirected to admin dashboard? (y/n): " dashboard_redirect
mark_test "Redirect to dashboard after login" $([ "$dashboard_redirect" == "y" ] && echo "pass" || echo "fail")

# ============================================================================
# SECTION 2: ADMIN MODULES TESTING
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 2: Admin Modules Testing (15 modules)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Module 1: Dashboard
echo -e "${YELLOW}Testing: Dashboard${NC}"
echo "Navigate to: Admin Dashboard"
echo "Check for: Statistics cards, recent activity"
read -p "Does dashboard show data correctly? (y/n): " dashboard_works
mark_test "Dashboard displays statistics" $([ "$dashboard_works" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 2: Schemes Management
echo -e "${YELLOW}Testing: Schemes Management${NC}"
echo "Navigate to: Admin → Schemes"
echo "1. Can you see list of schemes?"
read -p "Schemes list loads? (y/n): " schemes_list
mark_test "Schemes list displays" $([ "$schemes_list" == "y" ] && echo "pass" || echo "fail")

echo "2. Click 'Add New Scheme'"
echo "3. Fill in scheme details (both English & Marathi)"
echo "4. Click 'Save'"
read -p "Can you create a new scheme? (y/n): " scheme_create
mark_test "Create new scheme" $([ "$scheme_create" == "y" ] && echo "pass" || echo "fail")

echo "5. Click edit on any scheme"
echo "6. Modify some fields"
echo "7. Click 'Save'"
read -p "Can you edit a scheme? (y/n): " scheme_edit
mark_test "Edit existing scheme" $([ "$scheme_edit" == "y" ] && echo "pass" || echo "fail")

echo "8. Click delete on a test scheme"
read -p "Can you delete a scheme? (y/n): " scheme_delete
mark_test "Delete scheme" $([ "$scheme_delete" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 3: Officials Management
echo -e "${YELLOW}Testing: Officials Management${NC}"
echo "Navigate to: Admin → Officials"
read -p "Officials list loads? (y/n): " officials_list
mark_test "Officials list displays" $([ "$officials_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you add a new official with photo? (y/n): " official_create
mark_test "Create official with photo upload" $([ "$official_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 4: Developments Management
echo -e "${YELLOW}Testing: Developments Management${NC}"
echo "Navigate to: Admin → Developments"
read -p "Developments list loads? (y/n): " dev_list
mark_test "Developments list displays" $([ "$dev_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you create development with multiple images? (y/n): " dev_create
mark_test "Create development with images" $([ "$dev_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 5: Meetings Management
echo -e "${YELLOW}Testing: Meetings Management${NC}"
echo "Navigate to: Admin → Meetings"
read -p "Meetings list loads? (y/n): " meetings_list
mark_test "Meetings list displays" $([ "$meetings_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you create meeting with agenda & minutes? (y/n): " meeting_create
mark_test "Create meeting with documents" $([ "$meeting_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 6: Financial Reports
echo -e "${YELLOW}Testing: Financial Reports${NC}"
echo "Navigate to: Admin → Financial Reports"
read -p "Financial reports list loads? (y/n): " finance_list
mark_test "Financial reports list displays" $([ "$finance_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you upload financial report PDF? (y/n): " finance_create
mark_test "Upload financial report" $([ "$finance_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 7: Grievances Management
echo -e "${YELLOW}Testing: Grievances Management${NC}"
echo "Navigate to: Admin → Grievances"
read -p "Grievances list loads? (y/n): " grievances_list
mark_test "Grievances list displays" $([ "$grievances_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you view and update grievance status? (y/n): " grievance_update
mark_test "Update grievance status" $([ "$grievance_update" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 8: Forms Management
echo -e "${YELLOW}Testing: Forms Management${NC}"
echo "Navigate to: Admin → Forms"
read -p "Forms list loads? (y/n): " forms_list
mark_test "Forms list displays" $([ "$forms_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you create form with PDF upload? (y/n): " form_create
mark_test "Create form with PDF" $([ "$form_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 9: Gallery Management
echo -e "${YELLOW}Testing: Gallery Management${NC}"
echo "Navigate to: Admin → Gallery"
read -p "Gallery albums load? (y/n): " gallery_list
mark_test "Gallery albums display" $([ "$gallery_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you create album and upload images? (y/n): " gallery_create
mark_test "Create album with images" $([ "$gallery_create" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 10: Announcements Management
echo -e "${YELLOW}Testing: Announcements Management${NC}"
echo "Navigate to: Admin → Announcements"
read -p "Announcements list loads? (y/n): " announcements_list
mark_test "Announcements list displays" $([ "$announcements_list" == "y" ] && echo "pass" || echo "fail")

read -p "Can you create announcement (bilingual)? (y/n): " announcement_create
mark_test "Create bilingual announcement" $([ "$announcement_create" == "y" ] && echo "pass" || echo "fail")

echo "Check homepage for announcement banner"
read -p "Does announcement show on homepage? (y/n): " announcement_display
mark_test "Announcement displays on homepage" $([ "$announcement_display" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 11: Village Statistics
echo -e "${YELLOW}Testing: Village Statistics${NC}"
echo "Navigate to: Admin → Village Statistics"
read -p "Statistics form loads? (y/n): " stats_load
mark_test "Village statistics loads" $([ "$stats_load" == "y" ] && echo "pass" || echo "fail")

read -p "Can you update village statistics? (y/n): " stats_update
mark_test "Update village statistics" $([ "$stats_update" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 12: Settings
echo -e "${YELLOW}Testing: Settings Management${NC}"
echo "Navigate to: Admin → Settings"
read -p "Settings page loads? (y/n): " settings_load
mark_test "Settings page loads" $([ "$settings_load" == "y" ] && echo "pass" || echo "fail")

read -p "Can you update site settings? (y/n): " settings_update
mark_test "Update site settings" $([ "$settings_update" == "y" ] && echo "pass" || echo "fail")
echo ""

# Module 13-15: Additional modules
echo -e "${YELLOW}Testing: Other Modules${NC}"
read -p "Can you access File Manager? (y/n): " files_access
mark_test "File Manager accessible" $([ "$files_access" == "y" ] && echo "pass" || echo "fail")

read -p "Can you access Users Management? (y/n): " users_access
mark_test "Users Management accessible" $([ "$users_access" == "y" ] && echo "pass" || echo "fail")

read -p "Can you access Reports? (y/n): " reports_access
mark_test "Reports accessible" $([ "$reports_access" == "y" ] && echo "pass" || echo "fail")
echo ""

# ============================================================================
# SECTION 3: PUBLIC PAGES TESTING
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 3: Public Pages Testing${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "Logout from admin panel"
read -p "Press Enter when logged out..."

echo ""
echo "Testing public pages..."

pages=("Home:/" "About:/about" "Services:/services" "Downloads:/downloads" "Contact:/contact" "Gallery:/gallery" "Grievances:/grievances/submit")

for page_info in "${pages[@]}"; do
    IFS=':' read -r page_name page_url <<< "$page_info"
    echo ""
    echo "Navigate to: http://localhost:5173${page_url}"
    read -p "Does '$page_name' page load correctly? (y/n): " page_loads
    mark_test "Public page: $page_name" $([ "$page_loads" == "y" ] && echo "pass" || echo "fail")
done

# ============================================================================
# SECTION 4: LANGUAGE SWITCHING
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 4: Language Switching${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "1. On homepage, find language switcher (English/मराठी)"
echo "2. Click on मराठी"
read -p "Does content switch to Marathi? (y/n): " lang_marathi
mark_test "Switch to Marathi" $([ "$lang_marathi" == "y" ] && echo "pass" || echo "fail")

echo "3. Click on English"
read -p "Does content switch back to English? (y/n): " lang_english
mark_test "Switch to English" $([ "$lang_english" == "y" ] && echo "pass" || echo "fail")

# ============================================================================
# SECTION 5: MOBILE RESPONSIVENESS
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 5: Mobile Responsiveness${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "1. Open browser DevTools (F12)"
echo "2. Click toggle device toolbar (Ctrl+Shift+M)"
echo "3. Select 'iPhone 12 Pro' or similar mobile device"
echo ""
read -p "Does homepage look good on mobile? (y/n): " mobile_home
mark_test "Mobile: Homepage responsive" $([ "$mobile_home" == "y" ] && echo "pass" || echo "fail")

echo "4. Test admin panel on mobile view"
read -p "Does admin panel work on mobile? (y/n): " mobile_admin
mark_test "Mobile: Admin panel responsive" $([ "$mobile_admin" == "y" ] && echo "pass" || echo "fail")

echo "5. Test navigation menu on mobile"
read -p "Does mobile menu work? (y/n): " mobile_menu
mark_test "Mobile: Navigation menu works" $([ "$mobile_menu" == "y" ] && echo "pass" || echo "fail")

# ============================================================================
# SECTION 6: BROWSER COMPATIBILITY
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 6: Browser Compatibility (Optional)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Do you want to test other browsers? (y/n): " test_browsers

if [ "$test_browsers" == "y" ]; then
    browsers=("Chrome" "Firefox" "Safari" "Edge")
    
    for browser in "${browsers[@]}"; do
        echo ""
        echo "Open http://localhost:5173 in $browser"
        read -p "Does it work in $browser? (y/n/skip): " browser_works
        if [ "$browser_works" != "skip" ]; then
            mark_test "Browser: $browser compatibility" $([ "$browser_works" == "y" ] && echo "pass" || echo "fail")
        fi
    done
fi

# ============================================================================
# SECTION 7: SECURITY TESTING
# ============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SECTION 7: Security & Multi-Tenant Isolation${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "1. Logout from current session"
echo "2. Try to access: http://localhost:5173/admin/dashboard"
read -p "Were you redirected to login? (y/n): " auth_redirect
mark_test "Unauthorized access blocked" $([ "$auth_redirect" == "y" ] && echo "pass" || echo "fail")

echo ""
echo "3. Login again and check browser console (F12)"
echo "4. Look for any error messages"
read -p "Are there any security rule errors? (y/n): " security_errors
mark_test "No security rule violations" $([ "$security_errors" == "n" ] && echo "pass" || echo "fail")

# ============================================================================
# TEST SUMMARY
# ============================================================================
echo ""
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   TEST SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}🎉 Excellent! Your application is ready for production!${NC}"
elif [ $PASS_RATE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  Good, but some issues need attention before production${NC}"
else
    echo -e "${RED}❌ Several issues found. Please fix before deploying${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing complete! Results saved to: test-results.txt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save results
{
    echo "Gram Panchayat Testing Results"
    echo "=============================="
    echo "Date: $(date)"
    echo ""
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Pass Rate: $PASS_RATE%"
} > test-results.txt

echo "Next steps:"
echo "1. Fix any failed tests"
echo "2. Proceed to production build"
echo "3. Deploy to Firebase Hosting"
echo ""
