---
title: API Request Cookbook
date: 2025-04-25
categories:
  - api
  - database
tags:
  - python
  - requests
  - sqlite
draft: false
image: /img/banner/api_requests.png
layout: blog-post
toc: true
---

>[!Context]
> Over the years I've had to get overly familiar with API requests, and have reimplemented the same design pattern across multiple projects involving the retrieval, processing and display of API data.
>
> This article is a collection of these common workflows.\
> \
> In `Python` 🐍

### Resources

```python
import requests
import pandas as pd
import json
```
Links:\
https://requests.readthedocs.io/en/latest/api/ \
https://requests.readthedocs.io/en/latest/api/

Interactive Notebooks:\
../../notebooks/


### API Calls

```python
endpoint = "michaelmuratov.com"
response = requests.get(endpoint)
data = response.json()
```

The endpoint variable holds the URL of the API I want to query. In this case, "http://www.datasource.com".

I use requests.get(endpoint) to send an HTTP GET request to that URL. 

The server responds, and the response is stored in the response variable. Since most APIs today communicate using JSON, I make the automatic conversion of the text data into a parsable format.

#### Base64 Auth
```python
from requests.auth import HTTPBasicAuth
import base64

#with library
response = requests.get(endpoint, auth=HTTPBasicAuth('user', 'pass'))

#manually
auth_string = "userid:password"
b64Val = base64.b64encode(auth_string)
```

#### Over Proxy
```python

proxies = { 
  "http"  : http_proxy,
  "https" : https_proxy,
}

r = requests.get(endpoint, proxies=proxies)
```

#### With SSL Verification
```python

#no SSL verification
requests.get(endpoint, verify=False)

#Use default SSL verification
requests.get(endpoint, verify=True)

#Use custom SSL verification
requests.get(endpoint, verify=True, cert="cert.pem")
```

![Cert Dropdown](../../img/screenshot/api_requests-cert_dropdown.png)

![SSL Cert](../../img/screenshot/api_requests-ssl_cert.png)

### API Caching

#### API Data Processing

#### API Data File Write