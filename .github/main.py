import numpy as np
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.colors as colors

import os
import requests
import yaml
import pytz

from datetime import datetime
from dotenv import load_dotenv

from PIL import Image

load_dotenv()

site = os.getenv('SITE')
period = os.getenv('PERIOD')
token = os.getenv('TOKEN')
runtime = os.getenv('RUN')

def get_suffix(date):
    day = date.day
    if 11 <= day <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    return suffix

input_tz = pytz.timezone('UTC')
output_tz = pytz.timezone('Asia/Kolkata')

input_tz_format = '%Y-%m-%dT%H:%M:%S'

if runtime == "":
    runtime = datetime.now().strftime(input_tz_format)
    input_tz = pytz.timezone('Asia/Kolkata')

input_time = datetime.strptime(runtime, input_tz_format)
input_time = input_tz.localize(input_time)

output_time = input_time.astimezone(output_tz)

output_tz_format = f'%-I:%M %p, %-d{get_suffix(output_time)} %B %Y (%z)'

output_time_str = output_time.strftime(output_tz_format)

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

most_visitors_date, most_visitors_visitors = max(
    data_mod.items(), key=lambda x: x[1])

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

plt.style.use('dark_background')
plt.rcParams.update({'font.size': 12})
plt.rcParams.update({'axes.facecolor': '#111111'})

fig, ax = plt.subplots()

ax.plot(dates, visitors)

ax.tick_params(axis='x', labelrotation=45)
ax.set_xlim(dates[0], dates[-1])
ax.xaxis.set_major_locator(plt.MaxNLocator(5))

# ax.set_title('Vistors over the Last Month')

fig.savefig('./static/images/stats/monthly-visitors.png',
            dpi=300, bbox_inches='tight', transparent=False, facecolor="#111111")

url = 'https://plausible.io/api/v1/stats/breakdown'

params = {
    'site_id': site,
    'period': period,
    'property': 'visit:source',
    'limit': '5'
}

response = requests.get(url, headers=headers, params=params)

data = response.json()['results']

data_sorted = sorted(data, key=lambda x: x['visitors'], reverse=False)

sources = [d['source'] for d in data_sorted]
visitors = [d['visitors'] for d in data_sorted]

top_sources = sources[:-4:-1]
direct_link_string = "Traffic from direct links dropped because I have been using tags on links."

if 'Direct / None' in top_sources:
    direct_link_string = "There is a lot of traffic from direct links. I should level up my link-tagging game."

fig, ax = plt.subplots()
ax.barh(sources, visitors)

# ax.set_title('Top Sources')

fig.savefig('./static/images/stats/monthly-sources.png',
            dpi=300, bbox_inches='tight', transparent=False, facecolor="#111111")

url = 'https://plausible.io/api/v1/stats/breakdown'
params = {
    'site_id': site,
    "period": period,
    'property': 'visit:country',
    'metrics': 'visitors'
}

response = requests.get(url, headers=headers, params=params)

data = response.json()['results']

world = gpd.read_file("./.github/world_admin_boundary.geojson")
world = world[world.ADMIN != "Antarctica"]

df = pd.DataFrame(data)
merged_data = world.merge(df, left_on='ISO_A2', right_on='country')

top_countries = list(merged_data.sort_values(by='visitors', ascending=False).iloc[:4].ADMIN.values)

colors_list = ['#c6e9e3', '#8dd3c7', '#45b29f', '#317f72']
positions = [0.0, 0.05, 0.4, 1.0]
cmap = colors.LinearSegmentedColormap.from_list(
    'custom_cmap', list(zip(positions, colors_list)))

fig, ax = plt.subplots()

world.plot(ax=ax, facecolor="none", edgecolor='#ffffff', lw=.5)
merged_data.plot(ax=ax, column='visitors', cmap=cmap)

# ax.set_title('Visitors by Country')
ax.set_axis_off()

plt.savefig('./static/images/stats/visitors-by-country.png', dpi=300, bbox_inches='tight', transparent=False, facecolor="#111111")

im = Image.open('./static/images/stats/visitors-by-country.png')
im = im.crop((82, 41, 1467, 624))
im.save('./static/images/stats/visitors-by-country.png')

most_visitors_date = datetime.strptime(most_visitors_date, '%Y-%m-%d')

data_yaml = {
    'most_visitors_date': most_visitors_date.strftime(f'%-d{get_suffix(most_visitors_date)} %B %Y'),
    'most_visitors_visitors': most_visitors_visitors,
    'top_page_link': top_page_link,
    'top_page_visitors': top_page_visitors,
    'top_countries': top_countries,
    'top_sources': top_sources,
    'direct_link_string': direct_link_string,
    'runtime': output_time_str
}

with open('./data/stats/stats.yaml', 'w') as file:
    yaml.dump(data_yaml, file)
