import socket
import os
import json
import time
import yaml
import random
from datetime import datetime
import feedparser
import requests
from urllib.parse import urlparse
import html

# Set a default timeout for all socket operations
socket.setdefaulttimeout(30)  # 30 seconds timeout

# Use a realistic browser User-Agent to avoid being blocked by anti-bot measures
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

def get_session():
    """Create a requests session with browser-like headers"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
    })
    return session

def fetch_with_retry(session, url, max_retries=3, initial_delay=2):
    """Fetch URL with exponential backoff retry logic"""
    last_exception = None

    for attempt in range(max_retries):
        try:
            response = session.get(url, timeout=30, allow_redirects=True)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"  Retry {attempt + 1}/{max_retries - 1} after {delay:.1f}s: {str(e)}")
                time.sleep(delay)

    raise last_exception

def sanitize_feed_url(url):
    """Ensure the feed URL uses HTTPS when available"""
    parsed = urlparse(url)
    if parsed.scheme == 'http':
        # For known providers that support HTTPS, just upgrade
        known_https_hosts = ['feedburner.com', 'feeds.feedburner.com', 'substack.com']
        if any(host in parsed.netloc for host in known_https_hosts):
            return url.replace('http://', 'https://', 1)

        # For others, try HTTPS but fall back to HTTP
        https_url = url.replace('http://', 'https://', 1)
        try:
            session = get_session()
            response = session.head(https_url, timeout=10, allow_redirects=True)
            if response.status_code == 200:
                return https_url
        except Exception:
            pass  # Silently fall back to HTTP
    return url

def format_feed_output(blog_title, feed_url, post_title=None, post_url=None, error=None):
    """Format the output for a single feed"""
    output = [f"\nProcessing {blog_title} from {feed_url}"]

    if error:
        output.append(f"  Error: {error}")
    elif post_title and post_url:
        output.append(f"  Latest post: {html.unescape(post_title)}")
        output.append(f"  URL: {post_url}")

    return "\n".join(output)

def main():
    # Path to YAML file
    yaml_file_path = 'data/blogroll/blogroll.yaml'

    # Path to output JSON file
    json_file_path = 'data/blogroll/latest.json'

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

    # Load the YAML file
    with open(yaml_file_path, 'r') as file:
        blogroll_data = yaml.safe_load(file)

    # Initialize the result dictionary
    result = {
        'lastUpdated': datetime.now().isoformat(),
        'posts': []
    }

    # Create a session for all requests
    session = get_session()

    # Process each feed
    feeds = blogroll_data.get('feeds', [])
    total_feeds = len(feeds)

    for idx, feed in enumerate(feeds, 1):
        blog_title = feed.get('title', 'Unknown')
        blog_url = feed.get('htmlURL', '')
        feed_url = feed.get('xmlURL', '')

        print(f"[{idx}/{total_feeds}] Processing {blog_title}...")

        if not feed_url:
            print(format_feed_output(blog_title, "No feed URL provided", error="No feed URL provided"))
            continue

        try:
            # Try to use HTTPS if available
            feed_url = sanitize_feed_url(feed_url)

            # Special handling for rachelbythebay feed
            if "rachelbythebay.com" in feed_url:
                feed_url = "https://rachelbythebay.com/w/atom.xml"

            # Fetch the feed with retry logic
            response = fetch_with_retry(session, feed_url)

            # Parse with feedparser
            feed_data = feedparser.parse(response.text, sanitize_html=False)

            # Handle feed parsing errors
            if hasattr(feed_data, 'bozo_exception') and feed_data.bozo_exception:
                error_msg = str(feed_data.bozo_exception)

                # If it's an encoding error but we have entries, continue processing
                if feed_data.entries:
                    print(f"  Warning: Parse issue ({error_msg}), but found entries - continuing")
                else:
                    print(format_feed_output(blog_title, feed_url, error=error_msg))
                    result['posts'].append({
                        'blogTitle': blog_title,
                        'blogUrl': blog_url,
                        'error': True,
                        'errorMessage': error_msg
                    })
                    continue

            # Get the latest post
            if feed_data.entries and len(feed_data.entries) > 0:
                latest_entry = feed_data.entries[0]

                # Get post title
                post_title = latest_entry.get('title', 'No Title')

                # Get post URL (account for different feed formats)
                post_url = ''
                if 'link' in latest_entry:
                    post_url = latest_entry.link
                elif 'links' in latest_entry and latest_entry.links:
                    for link in latest_entry.links:
                        if link.get('rel') == 'alternate':
                            post_url = link.get('href', '')
                            break

                # Get publish date (account for different formats)
                publish_date = None
                if 'published' in latest_entry:
                    publish_date = latest_entry.published
                elif 'pubDate' in latest_entry:
                    publish_date = latest_entry.pubDate
                elif 'updated' in latest_entry:
                    publish_date = latest_entry.updated

                print(format_feed_output(blog_title, feed_url, post_title, post_url))

                # Add to results
                result['posts'].append({
                    'blogTitle': blog_title,
                    'blogUrl': blog_url,
                    'postTitle': post_title,
                    'postUrl': post_url,
                    'publishDate': publish_date
                })
            else:
                # No posts found
                print(format_feed_output(blog_title, feed_url, error="No posts found in feed"))
                result['posts'].append({
                    'blogTitle': blog_title,
                    'blogUrl': blog_url,
                    'error': True,
                    'errorMessage': 'No posts found in feed'
                })

        except Exception as e:
            print(format_feed_output(blog_title, feed_url, error=str(e)))
            result['posts'].append({
                'blogTitle': blog_title,
                'blogUrl': blog_url,
                'error': True,
                'errorMessage': str(e)
            })

        # Add a small random delay to avoid rate limiting
        time.sleep(random.uniform(1, 2))

    # Write the result to JSON file
    with open(json_file_path, 'w') as file:
        json.dump(result, file, indent=2)

    # Count successes and errors
    error_count = sum(1 for post in result['posts'] if post.get('error', False))
    success_count = len(result['posts']) - error_count

    print(f"\n{'=' * 50}")
    print(f"Completed: {success_count} successful, {error_count} errors out of {total_feeds} feeds")

    if error_count > 0:
        print(f"\nFeeds with errors:")
        for post in result['posts']:
            if post.get('error', False):
                print(f"  - {post['blogTitle']}: {post.get('errorMessage', 'Unknown error')}")

    print(f"\nSaved to {json_file_path}")

if __name__ == '__main__':
    main()
