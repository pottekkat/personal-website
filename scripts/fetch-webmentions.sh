#!/bin/bash
set -e

# Fetch webmentions from webmention.io and update data files

DOMAIN="${WEBMENTION_DOMAIN:-navendu.me}"
TOKEN="${WEBMENTION_TOKEN}"
DATA_DIR="data/webmentions"
MENTIONS_FILE="${DATA_DIR}/mentions.json"
LAST_FETCH_FILE="${DATA_DIR}/last_fetch.json"

if [ -z "$TOKEN" ]; then
  echo "Error: WEBMENTION_TOKEN environment variable is required"
  exit 1
fi

mkdir -p "$DATA_DIR"

# Read last fetch timestamp
SINCE=""
if [ -f "$LAST_FETCH_FILE" ]; then
  SINCE=$(jq -r '.timestamp // empty' "$LAST_FETCH_FILE" 2>/dev/null || echo "")
fi

# If no timestamp, fetch last 30 days
if [ -z "$SINCE" ]; then
  if command -v gdate &> /dev/null; then
    # macOS with coreutils
    SINCE=$(gdate -d '30 days ago' --iso-8601=seconds)
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS without coreutils
    SINCE=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S%z")
  else
    # Linux
    SINCE=$(date -d '30 days ago' --iso-8601=seconds)
  fi
  echo "No previous fetch timestamp, fetching since: $SINCE"
else
  echo "Fetching webmentions since: $SINCE"
fi

# Fetch webmentions with pagination
ALL_MENTIONS="[]"
PAGE=0
PER_PAGE=100

while true; do
  API_URL="https://webmention.io/api/mentions.jf2?token=${TOKEN}&per-page=${PER_PAGE}&page=${PAGE}"
  if [ -n "$SINCE" ]; then
    API_URL="${API_URL}&since=${SINCE}"
  fi

  echo "Fetching page $PAGE..."
  RESPONSE=$(curl -s "$API_URL")

  MENTIONS=$(echo "$RESPONSE" | jq -c '.children // []')
  MENTION_COUNT=$(echo "$MENTIONS" | jq 'length')

  echo "  Found $MENTION_COUNT mentions on page $PAGE"

  if [ "$MENTION_COUNT" -eq 0 ]; then
    break
  fi

  ALL_MENTIONS=$(echo "$ALL_MENTIONS" "$MENTIONS" | jq -s '.[0] + .[1]')

  if [ "$MENTION_COUNT" -lt "$PER_PAGE" ]; then
    break
  fi

  PAGE=$((PAGE + 1))
done

TOTAL_NEW=$(echo "$ALL_MENTIONS" | jq 'length')
echo "Total new mentions fetched: $TOTAL_NEW"

EXISTING_MENTIONS="[]"
if [ -f "$MENTIONS_FILE" ]; then
  EXISTING_MENTIONS=$(cat "$MENTIONS_FILE")
fi

# Merge and deduplicate by wm-id
MERGED=$(echo "$EXISTING_MENTIONS" "$ALL_MENTIONS" | jq -s '
  .[0] + .[1]
  | group_by(."wm-id")
  | map(.[0])
  | sort_by(."wm-received")
  | reverse
')

echo "$MERGED" > "$MENTIONS_FILE"
TOTAL_COUNT=$(echo "$MERGED" | jq 'length')
echo "Total mentions in database: $TOTAL_COUNT"

# Update last fetch timestamp
if command -v gdate &> /dev/null; then
  CURRENT_TIME=$(gdate --iso-8601=seconds)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  CURRENT_TIME=$(date --iso-8601=seconds)
else
  # macOS
  CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S%z")
fi
echo "{\"timestamp\": \"$CURRENT_TIME\"}" > "$LAST_FETCH_FILE"
echo "Updated last fetch time: $CURRENT_TIME"

echo "✓ Webmentions updated successfully!"
