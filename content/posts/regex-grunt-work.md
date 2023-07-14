---
title: "Grunt Work with RegEx"
date: 2023-07-14T09:10:27+08:00
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "My recent experience in using regular expressions to automate a menial task."
tags: ["automation", "regex", "software engineering"]
categories: ["Automation"]
cover:
    image: "/images/regex-grunt-work/scrabble-tiles-banner.jpg"
    alt: "Scrabble tiles falling in the air."
    caption: "Photo by [Piotr Łaskawski](https://unsplash.com/@tot87) on [Unsplash](https://unsplash.com/photos/gL7oJLJOb_I)"
    relative: false
---

A few days ago, one of our workflows to collect and display metrics from APISIX's public channels failed. The workflow could not push the collected metrics to the database, and our charts had week-long missing data.

Fortunately, we had logs that contained the missing metrics, but we needed to convert these to SQL queries to add the data manually. Writing SQL queries from more than a week of logs is tedious. And like any other engineer, I used this as an excuse to build automation.

The logs looked like this:

```text {hl_lines=["24-31"]}
2023-06-16T04:06:41.4852848Z ##[group]Run python main.py
2023-06-16T04:06:41.4853225Z [36;1mpython main.py[0m
2023-06-16T04:06:41.4907169Z shell: /usr/bin/bash -e {0}
2023-06-16T04:06:41.4907511Z env:
2023-06-16T04:06:41.4907865Z   pythonLocation: /opt/hostedtoolcache/Python/3.9.17/x64
2023-06-16T04:06:41.4908302Z   PKG_CONFIG_PATH: /opt/hostedtoolcache/Python/3.9.17/x64/lib/pkgconfig
2023-06-16T04:06:41.4908764Z   Python_ROOT_DIR: /opt/hostedtoolcache/Python/3.9.17/x64
2023-06-16T04:06:41.4909138Z   Python2_ROOT_DIR: /opt/hostedtoolcache/Python/3.9.17/x64
2023-06-16T04:06:41.4909544Z   Python3_ROOT_DIR: /opt/hostedtoolcache/Python/3.9.17/x64
2023-06-16T04:06:41.4909932Z   LD_LIBRARY_PATH: /opt/hostedtoolcache/Python/3.9.17/x64/lib
2023-06-16T04:06:41.4910442Z   CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE: /home/runner/work/xxx-metrics-xxx/xxx-metrics-xxx/gha-creds-66629ec6ee542974.json
2023-06-16T04:06:41.4911073Z   GOOGLE_APPLICATION_CREDENTIALS: /home/runner/work/xxx-metrics-xxx/xxx-metrics-xxx/gha-creds-66629ec6ee542974.json
2023-06-16T04:06:41.4911775Z   GOOGLE_GHA_CREDS_PATH: /home/runner/work/xxx-metrics-xxx/xxx-metrics-xxx/gha-creds-669789ec6ee542974.json
2023-06-16T04:06:41.4912226Z   CLOUDSDK_CORE_PROJECT: xxx-metrics-xxx-412278
2023-06-16T04:06:41.4912643Z   CLOUDSDK_PROJECT: xxx-metrics-xxx-412278
2023-06-16T04:06:41.4913012Z   GCLOUD_PROJECT: xxx-metrics-xxx-412278
2023-06-16T04:06:41.4913364Z   GCP_PROJECT: xxx-metrics-xxx-412278
2023-06-16T04:06:41.4913726Z   GOOGLE_CLOUD_PROJECT: xxx-metrics-xxx-412278
2023-06-16T04:06:41.4914674Z   TWITTER_TOKEN: ***
2023-06-16T04:06:41.4915100Z   GITHUB_TOKEN: ***
2023-06-16T04:06:41.4915390Z ##[endgroup]
2023-06-16T04:06:52.7931243Z Starting script for xxx-metrics-xxx
2023-06-16T04:06:52.7931915Z Creating BigQuery SQL statement
2023-06-16T04:06:52.7932395Z Fetching github metrics for APISIX
2023-06-16T04:06:52.7934186Z Metrics fetched: {'star': 12029, 'fork': 2239, 'watcher': 306, 'issue': 698}
2023-06-16T04:06:52.7940164Z Fetching dockerhub metrics for APISIX
2023-06-16T04:06:52.7940582Z Metrics fetched: {'star': 68, 'pull': 15336546}
2023-06-16T04:06:52.7947174Z Fetching medium metrics for APISIX
2023-06-16T04:06:52.7947554Z Metrics fetched: {'follower': 219}
2023-06-16T04:06:52.7949347Z Fetching stackoverflow metrics for APISIX
2023-06-16T04:06:52.7949744Z Metrics fetched: {'count': 43}
2023-06-16T04:06:52.7955023Z Big Query statement created
2023-06-16T04:06:52.7955343Z Creating BigQuery client
2023-06-16T04:06:52.7955651Z BigQuery client created
```

The highlighted lines show the important stuff. We had to get this data into a table that looks like this:

| SOURCE        | ACCOUNT | TYPE     | VALUE    | CREATED                       |
|---------------|---------|----------|----------|-------------------------------|
| github        | APISIX  | star     | 12029    | 2023-06-16 04:06:52.06614 UTC |
| github        | APISIX  | fork     | 2239     | 2023-06-16 04:06:52.06614 UTC |
| github        | APISIX  | watcher  | 306      | 2023-06-16 04:06:52.06614 UTC |
| github        | APISIX  | issue    | 698      | 2023-06-16 04:06:52.06614 UTC |
| dockerhub     | APISIX  | star     | 68       | 2023-06-16 04:06:52.06614 UTC |
| dockerhub     | APISIX  | pull     | 15336546 | 2023-06-16 04:06:52.06614 UTC |
| medium        | APISIX  | follower | 219      | 2023-06-16 04:06:52.06614 UTC |
| stackoverflow | APISIX  | count    | 43       | 2023-06-16 04:06:52.06614 UTC |

To add the missing data to the table, we need to write SQL queries like:

```sql
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('github', 'APISIX', 'star', 12029, '2023-06-16 04:06:52.793239 UTC');
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('github', 'APISIX', 'fork', 2239, '2023-06-16 04:06:52.793239 UTC');
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('github', 'APISIX', 'watcher', 306, '2023-06-16 04:06:52.793239 UTC');
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('github', 'APISIX', 'issue', 698, '2023-06-16 04:06:52.793239 UTC');
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('dockerhub', 'APISIX', 'star', 68, '2023-06-16 04:06:52.794016 UTC');
INSERT INTO DATASET.METRICS(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('dockerhub', 'APISIX', 'pull', 15336546, '2023-06-16 04:06:52.794016 UTC');
```

To automate this, we first needed to find the `SOURCE` and `ACCOUNT` from the log. For example, from the log:

```text
2023-06-16T04:06:52.7932395Z Fetching github metrics for APISIX
```

we should extract the `SOURCE` as `github` and `ACCOUNT` as `APISIX`. An easy way to do this is to use regular expressions (RegEx). And that's precisely what we did.

An important caveat here is that we know the structure of the logs beforehand, and we are sure it will be the same throughout. It is easy enough to use RegEx to capture the pattern of the logs and extract the relevant data. With this in mind, we used Python to write some RegEx:

```python
source_match = re.search(r"Fetching (\w+) metrics for (\w+)", log)
if source_match:
    source = source_match.group(1)
    account = source_match.group(2)
```

Once we have the `SOURCE` and `ACCOUNT`, we can get the metric `TYPE`s and its `VALUE`s from the logs. Since the metrics are in a dictionary string, we can directly store them for easy manipulation:

```python
metrics_match = re.search(r"Metrics fetched: (.+)", next_log)
if metrics_match:
    metrics_data = eval(metrics_match.group(1))
```

We also needed to convert the timestamps to a different format before storing them in the database. First, we extract the timestamps from the logs using RegEx, parse them, and then convert them to the desired format:

```python
timestamp_match = re.search(r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}Z)", log)
if timestamp_match:
    timestamp = timestamp_match.group(1)
    dt = parser.isoparse(timestamp)
    desired_format = "%Y-%m-%d %H:%M:%S.%f %Z"
    timestamp = dt.strftime(desired_format)
```

Finally, we will put all of this together to write an SQL query:

```python
for metric_type, value in metrics_data.items():
    query = f"INSERT INTO {table_name}(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('{source}', '{account}', '{metric_type}', {value}, '{timestamp}');"
    queries.append(query)
```
The entire code is shown below:

```python
import re
import os
from datetime import datetime
from dateutil import parser

log_file = "/content/2023_06_25_Read metrics and store them.txt"
query_file = "/content/25_queries.txt"
table_name = "DATASET.METRICS"
queries = []

with open(log_file, "r") as file:
    logs = file.readlines()

for log in logs:
    if "Fetching" in log and "metrics for" in log:
        source_match = re.search(r"Fetching (\w+) metrics for (\w+)", log)
        if source_match:
            source = source_match.group(1)
            account = source_match.group(2)

            next_log = logs[logs.index(log) + 1]
            metrics_match = re.search(r"Metrics fetched: (.+)", next_log)
            if metrics_match:
                metrics_data = eval(metrics_match.group(1))

                timestamp_match = re.search(r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}Z)", log)
                if timestamp_match:
                    timestamp = timestamp_match.group(1)
                    dt = parser.isoparse(timestamp)
                    desired_format = "%Y-%m-%d %H:%M:%S.%f %Z"
                    timestamp = dt.strftime(desired_format)

                    for metric_type, value in metrics_data.items():
                        query = f"INSERT INTO {table_name}(SOURCE, ACCOUNT, TYPE, VALUE, CREATED) VALUES ('{source}', '{account}', '{metric_type}', {value}, '{timestamp}');"
                        queries.append(query)

with open(query_file, "w") as file:
    for query in queries:
        print(query)
        file.write(query + "\n")
```

We were able to run the generated queries to patch the missing data in the database. The entire process was trivial and took about 30-40 minutes.

To sum it up, RegEx is powerful, and Python is trivial. Setting up similar automation to solve problems that would otherwise require grunt work is relatively straightforward. But it is also easy to go down the automation rabbit hole ending up doing more than some little manual work. I will leave you with a line:

{{< blockquote author="Lewis Carroll" title="Alice in Wonderland" >}}
Little Alice fell\
d\
o\
w\
n\
the hOle,\
bumped her head\
and bruised her soul
{{< /blockquote >}}
