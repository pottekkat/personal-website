import numpy as np
import matplotlib.pyplot as plt

import os
import requests
import yaml
import pytz
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

site = os.getenv('SITE')
period = os.getenv('PERIOD')
token = os.getenv('TOKEN')
runtime = os.getenv('RUN')

input_tz = pytz.timezone('UTC')
output_tz = pytz.timezone('Asia/Kolkata')

input_tz_format = '%Y-%m-%dT%H:%M:%S'
output_tz_format = '%-I:%M %p, %-d %B %Y (%z)'

input_time = datetime.strptime(runtime, input_tz_format)
input_time = input_tz.localize(input_time)

output_time = input_time.astimezone(output_tz)
output_time_str = output_time.strftime(output_tz_format)

def format_date(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d')
    day = date.day
    if 11 <= day <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    return date.strftime(f'%d{suffix} %B %Y')

url = 'https://plausible.io/api/v1/stats/timeseries'

params = {
    'site_id': site,
    'period': period,
}

headers = {
    'Authorization': f'Bearer {token}',
}

response = requests.get(url, headers=headers, params=params)
data = response.json()['results']

data_mod = {}

for item in data:
  date = item['date']
  visitors = item['visitors']
  data_mod[date] = visitors

dates, visitors = zip(*sorted(data_mod.items()))

dates = np.array(dates, dtype=np.datetime64)
dates = dates.astype('datetime64[D]')

most_visitors_date, most_visitors_visitors = max(data_mod.items(), key=lambda x: x[1])

url = 'https://plausible.io/api/v1/stats/breakdown'

params = {
    'site_id': site,
    'period': 'custom',
    'date': f'{most_visitors_date},{most_visitors_date}',
    'property': 'event:page',
    'limit': '1'
}

response = requests.get(url, headers=headers, params=params)

data = response.json()['results'][0]

top_page_link = data['page']
top_page_visitors = data['visitors']

data_yaml = {
    'most_visitors_date': format_date(most_visitors_date),
    'most_visitors_visitors': most_visitors_visitors,
    'top_page_link': top_page_link,
    'top_page_visitors': top_page_visitors,
    'runtime': output_time_str
}

fig, ax = plt.subplots()

plt.style.use('dark_background')
plt.rcParams.update({'font.size': 12})

ax.plot(dates, visitors)

ax.tick_params(axis='x', labelrotation=45)
ax.set_xlim(dates[0], dates[-1])
ax.xaxis.set_major_locator(plt.MaxNLocator(5))

ax.set_title('Vistors over the Last Month')

plt.show()

fig.savefig('./static/images/stats/monthly-visitors.png', dpi=300, bbox_inches='tight', transparent=True)

with open('./data/stats/stats.yaml', 'w') as file:
  yaml.dump(data_yaml, file)
