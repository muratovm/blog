---
title: API Request Cookbook
date: 2025-04-25
tags:
  - database
draft: false
image: /img/banner/api_requests.png
layout: blog-post
---

![image](../../../img/banner/api_requests.png)

>[!Context]
> Over the years I've had to get overly familiar with API requests, and have reimplemented the same design pattern across multiple projects involving the retrieval, processing and display of API data.
>
> This article is a collection of these common workflows.\
> \
> In `Python` 🐍


### Useful Libraries

```python
import requests
import pandas as pd
import json
```


Reference: https://requests.readthedocs.io/en/latest/api/


### API Calls

```python
endpoint = "http://www.datasources.com"
response = requests.get(endpoint)
data = response.json()
```

### API Calls with Base64 Auth

### API Calls over Proxy

### API Call Caching

### API Data Processing

### API Data File Write