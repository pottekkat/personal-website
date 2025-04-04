import socket
import os
import json
import time
import yaml
from datetime import datetime
import feedparser
import requests
from urllib.parse import urlparse
import html

# Set a default timeout for all socket operations
socket.setdefaulttimeout(10)  # 10 seconds timeout

def is_valid_feed_content_type(url):
    """Check if the URL returns a valid feed content type"""
    try:
        headers = requests.head(url, timeout=10).headers
        content_type = headers.get('content-type', '').lower()
        valid_types = ['application/rss+xml', 'application/atom+xml', 'application/xml', 'text/xml']
        return any(t in content_type for t in valid_types)
    except:
        return True  # If we can't check, assume it's valid

def sanitize_feed_url(url):
    """Ensure the feed URL uses HTTPS when available"""
    parsed = urlparse(url)
    if parsed.scheme == 'http':
        https_url = url.replace('http://', 'https://', 1)
        try:
            response = requests.head(https_url, timeout=10)
            if response.status_code == 200:
                return https_url
        except:
            pass
    return url

def format_feed_output(blog_title, feed_url, post_title=None, post_url=None, error=None):
    """Format the output for a single feed"""
    output = [f"\nProcessing {blog_title} from {feed_url}"]
    
    if error:
        output.append(f"❌ Error: {error}")
    elif post_title and post_url:
        output.append(f"✅ Latest post: {html.unescape(post_title)}")
        output.append(f"   URL: {post_url}")
    
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
    
    # Process each feed
    for feed in blogroll_data.get('feeds', []):
        blog_title = feed.get('title', 'Unknown')
        blog_url = feed.get('htmlURL', '')
        feed_url = feed.get('xmlURL', '')
        
        if not feed_url:
            print(format_feed_output(blog_title, "No feed URL provided", error="No feed URL provided"))
            continue
        
        try:
            # Try to use HTTPS if available
            feed_url = sanitize_feed_url(feed_url)
            
            # Special handling for rachelbythebay feed
            if "rachelbythebay.com" in feed_url:
                feed_url = "https://rachelbythebay.com/w/atom.xml"
            
            # Check content type before parsing
            if not is_valid_feed_content_type(feed_url):
                print(format_feed_output(blog_title, feed_url, error="Invalid feed content type"))
                continue
            
            # Parse the feed with additional parameters for better encoding handling
            feed_data = feedparser.parse(feed_url, sanitize_html=False)
            
            # Handle feed parsing errors
            if hasattr(feed_data, 'bozo_exception'):
                error_msg = str(feed_data.bozo_exception)
                
                # If it's an encoding error but we have entries, continue processing
                if "document declared as us-ascii" in error_msg and feed_data.entries:
                    print(f"\nWarning: Encoding mismatch for {blog_title}, but continuing")
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
        
        # Add a small delay to avoid overwhelming servers
        time.sleep(1)
    
    # Write the result to JSON file
    with open(json_file_path, 'w') as file:
        json.dump(result, file, indent=2)
    
    print(f"\nSuccessfully updated blogroll data. Saved to {json_file_path}")

if __name__ == '__main__':
    main()