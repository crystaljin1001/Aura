#!/bin/bash

# Logic Map JSON-LD Verification Script
# Tests if JSON-LD is properly injected in the initial HTML for bot discovery

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Logic Map JSON-LD Verification"
echo "=========================================="
echo ""

# Check if URL is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage: ./scripts/verify-logic-map-jsonld.sh <URL>${NC}"
  echo "Example: ./scripts/verify-logic-map-jsonld.sh http://localhost:3000/portfolio/owner-repo"
  exit 1
fi

URL=$1

echo "Testing URL: $URL"
echo ""

# Test 1: Check if JSON-LD exists in HTML
echo "Test 1: Checking for JSON-LD in initial HTML..."
if curl -s "$URL" | grep -q 'type="application/ld+json"'; then
  echo -e "${GREEN}✓ PASS${NC} - JSON-LD script tag found in HTML"
else
  echo -e "${RED}✗ FAIL${NC} - JSON-LD script tag NOT found in HTML"
  echo "This means bots cannot discover your Logic Map data!"
  exit 1
fi

# Test 2: Verify JSON-LD structure
echo ""
echo "Test 2: Validating JSON-LD structure..."
JSON_LD=$(curl -s "$URL" | sed -n '/<script type="application\/ld+json">/,/<\/script>/p' | sed '1d;$d')

if [ -z "$JSON_LD" ]; then
  echo -e "${RED}✗ FAIL${NC} - Could not extract JSON-LD content"
  exit 1
fi

# Check for required Schema.org fields
if echo "$JSON_LD" | grep -q '"@context".*"https://schema.org"'; then
  echo -e "${GREEN}✓ PASS${NC} - Valid Schema.org context"
else
  echo -e "${RED}✗ FAIL${NC} - Missing Schema.org context"
  exit 1
fi

if echo "$JSON_LD" | grep -q '"@type".*"CreativeWork"'; then
  echo -e "${GREEN}✓ PASS${NC} - Correct @type (CreativeWork)"
else
  echo -e "${RED}✗ FAIL${NC} - Invalid or missing @type"
  exit 1
fi

if echo "$JSON_LD" | grep -q '"designProcess"'; then
  echo -e "${GREEN}✓ PASS${NC} - designProcess field present"
else
  echo -e "${YELLOW}⚠ WARN${NC} - No designProcess field (no decisions added yet?)"
fi

# Test 3: Check if JSON-LD is valid JSON
echo ""
echo "Test 3: Validating JSON syntax..."
if echo "$JSON_LD" | jq empty 2>/dev/null; then
  echo -e "${GREEN}✓ PASS${NC} - Valid JSON structure"
else
  echo -e "${RED}✗ FAIL${NC} - Invalid JSON syntax"
  exit 1
fi

# Test 4: Simulate bot crawl
echo ""
echo "Test 4: Simulating Googlebot crawl..."
BOT_HTML=$(curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "$URL")
if echo "$BOT_HTML" | grep -q 'type="application/ld+json"'; then
  echo -e "${GREEN}✓ PASS${NC} - JSON-LD visible to Googlebot"
else
  echo -e "${RED}✗ FAIL${NC} - JSON-LD NOT visible to Googlebot"
  exit 1
fi

# Test 5: Check for evidence links in decisions
echo ""
echo "Test 5: Checking for evidence links..."
if echo "$JSON_LD" | grep -q 'github.com'; then
  EVIDENCE_COUNT=$(echo "$JSON_LD" | grep -o 'github.com' | wc -l)
  echo -e "${GREEN}✓ PASS${NC} - Found $EVIDENCE_COUNT GitHub evidence link(s)"
else
  echo -e "${YELLOW}⚠ WARN${NC} - No GitHub evidence links found (add permalinks to improve verification)"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}All critical tests passed!${NC}"
echo "=========================================="
echo ""
echo "Your Logic Map JSON-LD is properly configured for AI bot discovery."
echo ""
echo "Next steps:"
echo "1. Test with Google's Rich Results Test:"
echo "   https://search.google.com/test/rich-results"
echo ""
echo "2. Add GitHub permalinks to decisions for evidence verification"
echo ""
echo "3. Deploy and re-run this test on production URL"
echo ""
