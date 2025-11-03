#!/usr/bin/env python3
"""
Fetch links from Readwise Reader API and store them in a JSON file.
Uses a single API query with location=archive to get all items efficiently.
Filters out unwanted categories (email) and items without title/url.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

READWISE_TOKEN = os.environ.get('READWISE_TOKEN')
if not READWISE_TOKEN:
    print("Error: READWISE_TOKEN environment variable not set")
    sys.exit(1)

DATA_FILE = Path(__file__).parent.parent.parent / 'data' / 'links' / 'readwise.json'

WANTED_CATEGORIES = ['article', 'rss', 'pdf', 'tweet', 'video']

def fetch_documents(updated_after=None):
    """
    Fetch documents from Readwise API using location=archive.
    This returns all archived items sorted by saved_at (newest first).
    """
    all_documents = []
    next_page_cursor = None

    while True:
        params = {'location': 'archive'}
        if next_page_cursor:
            params['pageCursor'] = next_page_cursor
        if updated_after:
            params['updatedAfter'] = updated_after

        print(f"Fetching archived documents (updatedAfter={updated_after})...")

        try:
            response = requests.get(
                url="https://readwise.io/api/v3/list/",
                params=params,
                headers={"Authorization": f"Token {READWISE_TOKEN}"},
                timeout=30
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching documents: {e}")
            break

        data = response.json()
        all_documents.extend(data['results'])

        print(f"  Fetched {len(data['results'])} documents (total: {len(all_documents)})")

        next_page_cursor = data.get('nextPageCursor')
        if not next_page_cursor:
            break

    return all_documents

def load_existing_data():
    """Load existing links from JSON file."""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'last_updated': None,
        'links': []
    }

def save_data(data):
    """Save links to JSON file."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data['links'])} links to {DATA_FILE}")

def filter_and_format_document(doc):
    """Filter and format a document. Returns None if invalid."""
    # Only include wanted categories
    if doc.get('category') not in WANTED_CATEGORIES:
        return None

    # Only include documents with both title and source_url
    if not doc.get('title') or not doc.get('source_url'):
        return None

    # Skip email sources (mailto links)
    if doc.get('source_url', '').startswith('mailto:'):
        return None

    # Convert saved_at from UTC to IST
    saved_at = doc['saved_at']
    if saved_at:
        dt_utc = datetime.fromisoformat(saved_at.replace('Z', '+00:00'))
        dt_ist = dt_utc.astimezone(ZoneInfo('Asia/Kolkata'))
        saved_at = dt_ist.isoformat()

    return {
        'id': doc['id'],
        'title': doc['title'],
        'author': doc.get('author'),
        'source_url': doc['source_url'],
        'published_date': doc.get('published_date'),
        'saved_at': saved_at,
        'reading_time': doc.get('reading_time'),
        'category': doc['category']
    }

def main():
    """Main function to fetch and store Readwise links."""
    print("Starting Readwise links fetch...")

    data = load_existing_data()
    existing_ids = {link['id'] for link in data['links']}
    print(f"Loaded {len(data['links'])} existing links")

    updated_after = data['last_updated']
    documents = fetch_documents(updated_after)
    print(f"Fetched {len(documents)} total documents from archive")

    new_links = []
    for doc in documents:
        formatted = filter_and_format_document(doc)
        if formatted and formatted['id'] not in existing_ids:
            new_links.append(formatted)
            existing_ids.add(formatted['id'])

    if new_links:
        print(f"Found {len(new_links)} new links")
        data['links'] = new_links + data['links']
    else:
        print("No new links found")

    data['last_updated'] = datetime.now(ZoneInfo('Asia/Kolkata')).isoformat()

    save_data(data)
    print("Done!")

if __name__ == '__main__':
    main()
