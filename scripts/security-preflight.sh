#!/bin/bash

# Security Preflight Check
# Runs before every git commit to enforce security guardrails
# This script CANNOT be bypassed - all critical issues must be fixed before committing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 Running Security Preflight Check...${NC}"
echo ""

# Ensure Semgrep is available
if ! command -v semgrep &> /dev/null; then
    export PATH="/Users/crystaljin/Library/Python/3.9/bin:$PATH"
    if ! command -v semgrep &> /dev/null; then
        echo -e "${RED}❌ CRITICAL: Semgrep not found${NC}"
        echo "Install with: python3 -m pip install semgrep --user"
        exit 1
    fi
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|sql)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ No relevant files to scan. Proceeding.${NC}"
    exit 0
fi

echo "Scanning staged files:"
echo "$STAGED_FILES" | sed 's/^/  - /'
echo ""

# Run Semgrep on staged files
echo -e "${YELLOW}🔍 Running security analysis...${NC}"
echo ""

# Create temp file for Semgrep output
SEMGREP_OUTPUT=$(mktemp)

# Run Semgrep with error detection
if semgrep \
    --config .semgrep.yml \
    --severity ERROR \
    --json \
    --quiet \
    $STAGED_FILES > "$SEMGREP_OUTPUT" 2>&1; then

    # Check if there are any ERROR-level findings
    ERROR_COUNT=$(cat "$SEMGREP_OUTPUT" | grep -o '"severity": "ERROR"' | wc -l | tr -d ' ')

    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ CRITICAL SECURITY ISSUES DETECTED${NC}"
        echo -e "${RED}Found $ERROR_COUNT critical security issue(s)${NC}"
        echo ""

        # Show detailed findings
        semgrep --config .semgrep.yml --severity ERROR $STAGED_FILES

        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}🚨 COMMIT BLOCKED BY SECURITY GUARDRAILS 🚨${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Required Actions:${NC}"
        echo "  1. Review the security issues listed above"
        echo "  2. Fix ALL critical issues in the reported files"
        echo "  3. Stage your fixes: git add <file>"
        echo "  4. Run this check again: ./scripts/security-preflight.sh"
        echo "  5. Commit only after all issues are resolved"
        echo ""
        echo -e "${YELLOW}Common Fixes:${NC}"
        echo "  • Hardcoded credentials → Move to .env.local"
        echo "  • SQL injection risk → Use Supabase .eq() instead of template strings"
        echo "  • XSS risk → Use sanitizeString() before rendering"
        echo "  • Missing auth → Add getAuthenticatedUser() check"
        echo "  • 'any' types → Use 'unknown' with type guards"
        echo ""
        echo -e "${RED}This check cannot be bypassed. All issues must be fixed.${NC}"
        echo ""

        rm "$SEMGREP_OUTPUT"
        exit 1
    fi
fi

# Check for warnings
echo -e "${YELLOW}🔍 Checking for warnings...${NC}"
WARNING_COUNT=$(semgrep --config .semgrep.yml --severity WARNING --json --quiet $STAGED_FILES 2>/dev/null | grep -o '"severity": "WARNING"' | wc -l | tr -d ' ' || echo "0")

if [ "$WARNING_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNING_COUNT warning(s)${NC}"
    echo ""
    semgrep --config .semgrep.yml --severity WARNING $STAGED_FILES
    echo ""
    echo -e "${YELLOW}Warnings don't block commits but should be addressed.${NC}"
    echo ""
fi

# Clean up
rm -f "$SEMGREP_OUTPUT"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Security Preflight Check PASSED${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "No critical security issues detected. Safe to commit."
echo ""

exit 0
