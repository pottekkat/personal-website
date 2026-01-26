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

# List of public RSS-Bridge instances to try as fallback
RSS_BRIDGE_INSTANCES = [
    'https://rss-bridge.bb8.fun/',
    'https://rss-bridge.org/bridge01/',
    'https://rss.nixnet.services/',
    'https://wtf.roflcopter.fr/rss-bridge/',
]

def get_headers():
    """Get browser-like headers"""
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
    }

def get_session():
    """Create a requests session with browser-like headers"""
    session = requests.Session()
    session.headers.update(get_headers())
    return session

def is_substack_url(url):
    """Check if URL is a Substack feed"""
    substack_indicators = [
        'substack.com',
        '.substack.com',
    ]
    # Also check for common Substack custom domain patterns (URLs ending in /feed)
    return any(indicator in url for indicator in substack_indicators) or url.endswith('/feed')

def fetch_with_requests(session, url, max_retries=3, initial_delay=2):
    """Fetch URL using requests with retry logic"""
    last_exception = None

    for attempt in range(max_retries):
        try:
            response = session.get(url, timeout=30, allow_redirects=True)
            response.raise_for_status()
            return response.text, None
        except requests.exceptions.RequestException as e:
            last_exception = e
            if attempt < max_retries - 1:
                # Only retry on certain errors, not on 403 (which won't change)
                if hasattr(e, 'response') and e.response is not None and e.response.status_code == 403:
                    break  # Don't retry 403s
                delay = initial_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"  Retry {attempt + 1}/{max_retries - 1} after {delay:.1f}s: {str(e)}")
                time.sleep(delay)

    return None, last_exception

def fetch_with_feedparser(url):
    """Fetch URL directly using feedparser's internal urllib"""
    try:
        feed_data = feedparser.parse(
            url,
            request_headers=get_headers(),
            sanitize_html=False
        )
        # Check if request was successful
        status = feed_data.get('status', 0)
        if status == 403:
            return None, Exception(f"403 Forbidden (feedparser)")
        if status >= 400:
            return None, Exception(f"HTTP {status} (feedparser)")
        return feed_data, None
    except Exception as e:
        return None, e

def fetch_via_rss_bridge(url):
    """Try to fetch Substack feed via RSS-Bridge instances"""
    # Extract the base URL for Substack
    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    for bridge_url in RSS_BRIDGE_INSTANCES:
        try:
            bridge_feed_url = f"{bridge_url}?action=display&bridge=SubstackBridge&url={base_url}&format=Atom"
            print(f"  Trying RSS-Bridge: {bridge_url}")

            feed_data = feedparser.parse(
                bridge_feed_url,
                request_headers=get_headers(),
                sanitize_html=False
            )

            # Check if we got valid entries (RSS-Bridge returns error in feed if it fails)
            if feed_data.entries:
                first_title = feed_data.entries[0].get('title', '')
                # RSS-Bridge returns error messages as entry titles
                if 'error' not in first_title.lower() and 'bridge returned' not in first_title.lower():
                    return feed_data, None
        except Exception:
            continue

    return None, Exception("All RSS-Bridge instances failed")

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

def format_feed_output(blog_title, feed_url, post_title=None, post_url=None, error=None, method=None):
    """Format the output for a single feed"""
    output = [f"\nProcessing {blog_title} from {feed_url}"]

    if method:
        output[0] += f" [{method}]"

    if error:
        output.append(f"  Error: {error}")
    elif post_title and post_url:
        output.append(f"  Latest post: {html.unescape(post_title)}")
        output.append(f"  URL: {post_url}")

    return "\n".join(output)

def fetch_feed(session, feed_url):
    """
    Fetch feed with multiple fallback methods:
    1. Try requests library first
    2. If 403, try feedparser's direct URL fetching
    3. If still failing and it's a Substack URL, try RSS-Bridge
    """
    feed_data = None
    method = "requests"

    # Method 1: Try requests
    content, error = fetch_with_requests(session, feed_url, max_retries=2)

    if content:
        feed_data = feedparser.parse(content, sanitize_html=False)
    elif error:
        is_403 = '403' in str(error)

        # Method 2: Try feedparser direct (uses urllib internally)
        if is_403:
            print(f"  Requests got 403, trying feedparser direct...")
            method = "feedparser"
            feed_data, fp_error = fetch_with_feedparser(feed_url)

            if fp_error and '403' in str(fp_error):
                # Method 3: Try RSS-Bridge for Substack feeds
                if is_substack_url(feed_url):
                    print(f"  Feedparser also got 403, trying RSS-Bridge...")
                    method = "rss-bridge"
                    feed_data, bridge_error = fetch_via_rss_bridge(feed_url)
                    if bridge_error:
                        return None, f"All methods failed: {bridge_error}", method
                elif fp_error:
                    return None, str(fp_error), method
            elif fp_error:
                return None, str(fp_error), method
        else:
            return None, str(error), method

    return feed_data, None, method

def extract_post_info(feed_data):
    """Extract post information from feed data"""
    if not feed_data or not feed_data.entries or len(feed_data.entries) == 0:
        return None

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

    return {
        'post_title': post_title,
        'post_url': post_url,
        'publish_date': publish_date
    }

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

            # Fetch the feed with fallback methods
            feed_data, error, method = fetch_feed(session, feed_url)

            if error:
                print(format_feed_output(blog_title, feed_url, error=error, method=method))
                result['posts'].append({
                    'blogTitle': blog_title,
                    'blogUrl': blog_url,
                    'error': True,
                    'errorMessage': error
                })
                continue

            # Handle feed parsing errors
            if hasattr(feed_data, 'bozo') and feed_data.bozo:
                bozo_exception = getattr(feed_data, 'bozo_exception', None)
                if bozo_exception:
                    error_msg = str(bozo_exception)
                    # If we have entries despite the error, continue
                    if not feed_data.entries:
                        print(format_feed_output(blog_title, feed_url, error=error_msg, method=method))
                        result['posts'].append({
                            'blogTitle': blog_title,
                            'blogUrl': blog_url,
                            'error': True,
                            'errorMessage': error_msg
                        })
                        continue
                    else:
                        print(f"  Warning: Parse issue but found entries - continuing")

            # Extract post info
            post_info = extract_post_info(feed_data)

            if post_info:
                print(format_feed_output(
                    blog_title, feed_url,
                    post_title=post_info['post_title'],
                    post_url=post_info['post_url'],
                    method=method
                ))

                result['posts'].append({
                    'blogTitle': blog_title,
                    'blogUrl': blog_url,
                    'postTitle': post_info['post_title'],
                    'postUrl': post_info['post_url'],
                    'publishDate': post_info['publish_date']
                })
            else:
                print(format_feed_output(blog_title, feed_url, error="No posts found in feed", method=method))
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
