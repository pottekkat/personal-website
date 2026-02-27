#!/usr/bin/env bash
#
# test-site.sh — Comprehensive site health check for navendu.me
#
# Usage:
#   ./scripts/test-site.sh              # test against localhost:1313 (default)
#   ./scripts/test-site.sh https://navendu.me   # test against production
#
# Prerequisites: curl, jq, hugo (for build test)

set -euo pipefail

BASE_URL="${1:-http://localhost:1313}"
BASE_URL="${BASE_URL%/}" # strip trailing slash

PASS=0
FAIL=0
WARN=0
ERRORS=()

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

pass() { ((PASS++)); green "  PASS: $1"; }
fail() { ((FAIL++)); red   "  FAIL: $1"; ERRORS+=("$1"); }
warn() { ((WARN++)); yellow "  WARN: $1"; }

check_url() {
    local url="$1"
    local label="${2:-$url}"
    local expected="${3:-200}"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$code" = "$expected" ]; then
        pass "$label -> $code"
    else
        fail "$label -> $code (expected $expected)"
    fi
}

# Follow redirects and check final status
check_url_follow() {
    local url="$1"
    local label="${2:-$url}"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$code" = "200" ]; then
        pass "$label -> 200 (after redirects)"
    else
        fail "$label -> $code (expected 200 after redirects)"
    fi
}

check_no_redirect() {
    local url="$1"
    local label="${2:-$url}"
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if [ "$code" = "200" ]; then
        pass "$label -> 200 (no redirect)"
    elif [ "$code" = "301" ] || [ "$code" = "302" ]; then
        warn "$label -> $code (redirect, add trailing slash to internal links)"
    else
        fail "$label -> $code (expected 200)"
    fi
}

# ─────────────────────────────────────────────
bold ""
bold "============================================"
bold "  Site Health Check: $BASE_URL"
bold "============================================"
bold ""

# ─────────────────────────────────────────────
bold "1. Hugo Build"
bold "─────────────────────────────────────────"
if hugo --gc --minify 2>&1 | grep -qi "error"; then
    fail "Hugo build has errors"
else
    pass "Hugo build succeeds"
fi

# ─────────────────────────────────────────────
bold ""
bold "2. Core Pages"
bold "─────────────────────────────────────────"
check_url "$BASE_URL/" "Homepage"
check_url "$BASE_URL/about/" "About"
check_url "$BASE_URL/now/" "Now"
check_url "$BASE_URL/posts/" "Posts index"
check_url "$BASE_URL/dailies/" "Dailies index"
check_url "$BASE_URL/archives/" "Archives"
check_url "$BASE_URL/search/" "Search"
check_url "$BASE_URL/subscribe/" "Subscribe"
check_url "$BASE_URL/links/" "Links"
check_url "$BASE_URL/categories/" "Categories"
check_url "$BASE_URL/tags/" "Tags"

# ─────────────────────────────────────────────
bold ""
bold "3. Static Assets & Favicons"
bold "─────────────────────────────────────────"
check_url "$BASE_URL/favicon.ico" "favicon.ico"
check_url "$BASE_URL/favicon-16x16.png" "favicon-16x16.png"
check_url "$BASE_URL/favicon-32x32.png" "favicon-32x32.png"
check_url "$BASE_URL/apple-touch-icon.png" "apple-touch-icon.png"
check_url "$BASE_URL/logo.png" "logo.png"
check_url "$BASE_URL/site.webmanifest" "site.webmanifest"

# This was removed — should 404
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/safari-pinned-tab.svg" 2>/dev/null || echo "000")
if [ "$code" = "404" ]; then
    pass "safari-pinned-tab.svg correctly 404s (removed reference)"
else
    warn "safari-pinned-tab.svg returned $code (expected 404 since reference was removed)"
fi

# ─────────────────────────────────────────────
bold ""
bold "4. RSS Feeds"
bold "─────────────────────────────────────────"
check_url "$BASE_URL/index.xml" "Main RSS feed"
check_url "$BASE_URL/posts/index.xml" "Posts RSS feed"
check_url "$BASE_URL/dailies/index.xml" "Dailies RSS feed"

# Check that paginated RSS URLs don't exist (they shouldn't)
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/posts/page/2/index.xml" 2>/dev/null || echo "000")
if [ "$code" = "404" ]; then
    pass "Paginated RSS /posts/page/2/index.xml correctly 404s"
else
    warn "Paginated RSS /posts/page/2/index.xml returned $code (should not exist)"
fi

# Check that homepage HTML doesn't contain paginated RSS links
homepage_html=$(curl -s --max-time 10 "$BASE_URL/" 2>/dev/null)
if echo "$homepage_html" | grep -q 'page/[0-9]*/index.xml'; then
    fail "Homepage contains paginated RSS link in <head>"
else
    pass "Homepage has no paginated RSS links"
fi

# ─────────────────────────────────────────────
bold ""
bold "5. Previously Broken URLs (Fixed 404s)"
bold "─────────────────────────────────────────"

# black-felt.png was referenced in noscript CSS — should 404 (and that's fine now)
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/images/black-felt.png" 2>/dev/null || echo "000")
if [ "$code" = "404" ]; then
    pass "black-felt.png 404s (reference removed from CSS, so this is fine)"
else
    pass "black-felt.png returned $code"
fi

# drivers-trophy image should now resolve
check_url "$BASE_URL/images/25-3-23-from-bahrain/drivers-trophy.jpeg" "drivers-trophy.jpeg image"

# Fixed post links should resolve
check_url_follow "$BASE_URL/posts/how-the-lfx-mentorship-program-helped-me-level-up-my-career/" "LFX mentorship post"
check_url_follow "$BASE_URL/dailies/15-12-22-goodbye-google-analytics/" "Goodbye Google Analytics daily"

# The deleted post should 404
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/posts/building-your-career-in-open-source/" 2>/dev/null || echo "000")
if [ "$code" = "404" ]; then
    pass "Deleted post /posts/building-your-career-in-open-source/ correctly 404s"
else
    warn "Deleted post returned $code (expected 404)"
fi

# ─────────────────────────────────────────────
bold ""
bold "6. Trailing Slash Consistency"
bold "─────────────────────────────────────────"
# These URLs should respond 200 directly (not redirect)
check_no_redirect "$BASE_URL/about/" "/about/ (with slash)"
check_no_redirect "$BASE_URL/categories/featured/" "/categories/featured/ (with slash)"
check_no_redirect "$BASE_URL/now/" "/now/ (with slash)"
check_no_redirect "$BASE_URL/subscribe/" "/subscribe/ (with slash)"

# ─────────────────────────────────────────────
bold ""
bold "7. HTML Quality Checks"
bold "─────────────────────────────────────────"

# Check homepage has lang attribute
if echo "$homepage_html" | grep -q '<html[^>]*lang='; then
    pass "Homepage has lang attribute on <html>"
else
    fail "Homepage missing lang attribute on <html>"
fi

# Check homepage has charset meta
if echo "$homepage_html" | grep -qi 'charset=utf-8\|charset=UTF-8'; then
    pass "Homepage has charset=utf-8"
else
    fail "Homepage missing charset meta"
fi

# Check homepage has viewport meta
if echo "$homepage_html" | grep -q 'viewport'; then
    pass "Homepage has viewport meta tag"
else
    fail "Homepage missing viewport meta tag"
fi

# Check homepage has title
if echo "$homepage_html" | grep -q '<title>'; then
    pass "Homepage has <title> tag"
else
    fail "Homepage missing <title> tag"
fi

# Check homepage has canonical link
if echo "$homepage_html" | grep -q 'rel="canonical"'; then
    pass "Homepage has canonical link"
else
    warn "Homepage missing canonical link"
fi

# Check homepage has RSS link
if echo "$homepage_html" | grep -q 'type="application/rss+xml"'; then
    pass "Homepage has RSS link in <head>"
else
    fail "Homepage missing RSS link in <head>"
fi

# Check a post page has Open Graph meta
post_html=$(curl -s --max-time 10 "$BASE_URL/posts/" 2>/dev/null)
if echo "$post_html" | grep -q 'og:title'; then
    pass "Posts page has Open Graph meta tags"
else
    warn "Posts page missing Open Graph meta tags"
fi

# ─────────────────────────────────────────────
bold ""
bold "8. Robots & Sitemap"
bold "─────────────────────────────────────────"
check_url "$BASE_URL/robots.txt" "robots.txt"
check_url "$BASE_URL/sitemap.xml" "sitemap.xml"

# Check robots.txt references sitemap
robots_txt=$(curl -s --max-time 10 "$BASE_URL/robots.txt" 2>/dev/null)
if echo "$robots_txt" | grep -qi 'sitemap'; then
    pass "robots.txt references sitemap"
else
    warn "robots.txt doesn't reference sitemap"
fi

# ─────────────────────────────────────────────
bold ""
bold "9. Content Spot Checks (sample posts load)"
bold "─────────────────────────────────────────"
# Pick a few known posts to verify they load
check_url_follow "$BASE_URL/posts/everything-about-gsoc/" "GSoC post"
check_url_follow "$BASE_URL/posts/sandbox-mcp/" "Sandbox MCP post"
check_url_follow "$BASE_URL/dailies/25-3-23-from-bahrain/" "Bahrain daily"
check_url_follow "$BASE_URL/dailies/25-2-22-never-have-i-ever-been-published-in-print-media/" "Print media daily"

# ─────────────────────────────────────────────
bold ""
bold "10. Internal Link Sampling from Built HTML"
bold "─────────────────────────────────────────"
# Sample internal links from a few pages and check them
sample_pages=(
    "$BASE_URL/"
    "$BASE_URL/about/"
    "$BASE_URL/posts/"
)

checked_links=()
link_errors=0

for page_url in "${sample_pages[@]}"; do
    page_html=$(curl -s --max-time 10 "$page_url" 2>/dev/null)
    # Extract internal href links (skip anchors, mailto, javascript, external)
    links=$(echo "$page_html" | grep -oP 'href="(/[^"]*)"' | sed 's/href="//;s/"$//' | sort -u | head -20)
    for link in $links; do
        # Skip anchor-only links, RSS xml, and already checked
        [[ "$link" == "#"* ]] && continue
        [[ "$link" == *".xml" ]] && continue
        [[ " ${checked_links[*]:-} " == *" $link "* ]] && continue
        checked_links+=("$link")

        code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${BASE_URL}${link}" 2>/dev/null || echo "000")
        if [ "$code" = "200" ]; then
            : # silent pass for sampled links
        else
            fail "Sampled link $link -> $code"
            ((link_errors++))
        fi
    done
done

if [ "$link_errors" -eq 0 ]; then
    pass "All ${#checked_links[@]} sampled internal links resolve (from homepage, about, posts index)"
else
    fail "$link_errors of ${#checked_links[@]} sampled links broken"
fi

# ─────────────────────────────────────────────
bold ""
bold "11. netlify.toml Validation"
bold "─────────────────────────────────────────"
if [ -f "netlify.toml" ]; then
    # Check for valid TOML structure (basic check)
    if grep -q '^\[\[redirects\]\]' netlify.toml && grep -q '^\[\[headers\]\]' netlify.toml; then
        pass "netlify.toml has redirects and headers sections"
    else
        warn "netlify.toml may be missing redirects or headers"
    fi

    # Check redirect targets respond
    redirect_targets=$(grep -oP 'to = "(/[^"]*)"' netlify.toml | sed 's/to = "//;s/"$//')
    redirect_ok=true
    for target in $redirect_targets; do
        code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${BASE_URL}${target}" 2>/dev/null || echo "000")
        if [ "$code" != "200" ]; then
            fail "Netlify redirect target $target -> $code"
            redirect_ok=false
        fi
    done
    if $redirect_ok; then
        pass "All local Netlify redirect targets resolve"
    fi
else
    warn "netlify.toml not found"
fi

# ─────────────────────────────────────────────
bold ""
bold "12. JSON Data Files"
bold "─────────────────────────────────────────"
# Validate readwise.json is valid JSON
if [ -f "data/links/readwise.json" ]; then
    if jq empty data/links/readwise.json 2>/dev/null; then
        pass "readwise.json is valid JSON"
        link_count=$(jq '.links | length' data/links/readwise.json)
        pass "readwise.json has $link_count links"
    else
        fail "readwise.json is invalid JSON"
    fi

    # Check that no links use /daily/ instead of /dailies/
    if grep -q '"navendu.me/daily/' data/links/readwise.json; then
        fail "readwise.json still has /daily/ URLs (should be /dailies/)"
    else
        pass "readwise.json has no /daily/ URLs"
    fi
else
    warn "readwise.json not found"
fi

# Check other JSON data files
for f in data/links/*.json; do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    if jq empty "$f" 2>/dev/null; then
        pass "$fname is valid JSON"
    else
        fail "$fname is invalid JSON"
    fi
done

# ─────────────────────────────────────────────
bold ""
bold "============================================"
bold "  Results"
bold "============================================"
green "  Passed: $PASS"
[ "$WARN" -gt 0 ] && yellow "  Warnings: $WARN"
[ "$FAIL" -gt 0 ] && red "  Failed: $FAIL"
bold ""

if [ "$FAIL" -gt 0 ]; then
    red "Failures:"
    for err in "${ERRORS[@]}"; do
        red "  - $err"
    done
    exit 1
else
    green "All checks passed!"
    exit 0
fi
