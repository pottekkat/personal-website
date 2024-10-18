import feedparser

from dotenv import load_dotenv
from datetime import datetime

from mailchimp_marketing import Client
from mailchimp_marketing.api_client import ApiClientError

import os

load_dotenv()

rss_url = os.getenv('RSS_URL')
api_key = os.getenv('API_KEY')
template_name = os.getenv('TEMPLATE_NAME')
test_email = os.getenv('TEST_EMAIL')


def get_latest_post(rss_url):
    feed = feedparser.parse(rss_url)
    if feed.entries:
        latest_post = feed.entries[0]
        return {
            'title': latest_post.title,
            'description': latest_post.description,
            'date': latest_post.published,
            'link': latest_post.link,
            'encoded': latest_post.content[0].value if latest_post.content else None
        }
    else:
        return None


def format_date(date):
    date = datetime.strptime(date, '%a, %d %b %Y %H:%M:%S %z')
    return date.strftime('%B %d, %Y')


latest_post = get_latest_post(rss_url)

latest_post['date'] = format_date(latest_post['date'])

if latest_post:
    print('Title:', latest_post['title'])
    print('Description:', latest_post['description'])
    print('Date:', latest_post['date'])
    print('Link:', latest_post['link'])

    with open(template_name, 'r') as file:
        template = file.read()

        template = template.replace('{{title}}', latest_post['title'])
        template = template.replace('{{date}}', latest_post['date'])
        template = template.replace('{{link}}', latest_post['link'])
        template = template.replace('{{encoded}}', latest_post['encoded'])
else:
    print('No posts found in the RSS feed.')

mailchimp = Client()
mailchimp.set_config({
    "api_key": api_key,
    "server": "us5"
})

response = mailchimp.ping.get()
print(response)

try:
    response = mailchimp.campaigns.create({
        "type": "regular",
        "recipients": {
            "list_id": "5ff8367bc1"
        },
        "settings": {
            "subject_line": latest_post['title'],
            "preview_text": latest_post['description'],
            "title": "Newsletter - " + latest_post['date'],
            "from_name": "Navendu Pottekkat",
            "reply_to": "hello@navendu.me"
        }
    })
    print(response)

    campaign_id = response['id']
    response = mailchimp.campaigns.set_content(campaign_id, {
        "html": template
    })
    print(response)

    response = mailchimp.campaigns.send_test_email(campaign_id, {
        "test_emails": [test_email],
        "send_type": "html"
    })
    print(response)

except ApiClientError as error:
    print("Error: {}".format(error.text))
