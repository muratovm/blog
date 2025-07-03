---
title: API Request Cookbook
date: 2025-04-25
categories:
  - web
  - database
tags:
  - python
  - requests
  - sqlite
draft: false
image: api_requests.png
layout: blog-post
toc: true
---

>[!Context]
> Over the years I've had to get overly familiar with API requests, when dealing with threat intelligence feeds and have reimplemented the same design pattern across multiple projects involving the retrieval, processing and display of API data.
>
> This article is a collection of these common workflows.\
> \
> In `Python` 🐍

### Resources

{{< aside >}}
Common libraries used when working with API requests in Python
{{</ aside >}}

- `requests`: The standard library for making HTTP requests
- `pandas`: For data manipulation and analysis
- `sqlite3`: For local database storage
- `json`: For parsing and handling JSON data
- `aiohttp`: For asynchronous HTTP requests
- `httpx`: Modern HTTP client with async support
- `beautifulsoup4`: For parsing HTML responses
- `pydantic`: For data validation and settings management
- `xmltodict`: For parsing XML responses

{{< aside >}}
My typical workflow involves
{{</ aside >}}

1. Making API requests with `requests`
2. Processing the response data with `pandas`
3. Storing results in SQLite for persistence
4. Using `json` for parsing API responses

This combination gives a robust foundation for handling API data workflows, from retrieval to storage and analysis.


```python
import requests
import pandas as pd
import json
```
**Links:**\
https://requests.readthedocs.io/en/latest/api/

**Interactive Notebooks:**\
../../notebooks/


### API Calls

```python
#Simple API Call to an endpoint
endpoint = "https://www.michaelmuratov.com"
response = requests.get(endpoint)
data = response.json()
```

The endpoint variable contains the target API URL, which in this example is
https://www.michaelmuratov.com.

Using the requests library, send an HTTP GET request to this endpoint with `requests.get(endpoint)`.

When the server responds, store the result in the response variable. Since modern APIs typically use JSON for data exchange, I convert the response text into a structured format using `response.json()`.

#### Base64 Auth

Base64 encoding is commonly used in HTTP requests for authentication and data transfer. Here's how it works:

1. **Basic Authentication:**
   - Username and password are combined with a colon: `username:password`
   - The string is encoded to Base64
   - Added to the Authorization header as: `Basic <base64_string>`

2. **Common Use Cases:**
   - HTTP Basic Authentication
   - API Key encoding
   - Binary data transfer in JSON
   - File uploads

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

When making requests through a proxy server, there are several important considerations:

1. **Proxy Configuration:**
   - HTTP and HTTPS proxies can be configured separately
   - Proxy authentication may be required
   - Some proxies may require specific headers

2. **Common Issues:**
   - Proxy connection timeouts
   - SSL/TLS verification with proxies
   - Proxy authentication failures
   - DNS resolution through proxy

3. **Best Practices:**
   - Always verify proxy connectivity before making requests
   - Handle proxy authentication securely
   - Consider proxy performance impact
   - Monitor proxy connection status

When working with proxies in Python requests, these are the important factors to consider:

- Basic Proxy Configuration
- Proxy Authentication
- SSL/TLS Verification
- Proxy Connection Timeout
- Proxy Error Handling


#### Basic Proxy Configuration

```python
# Define where the proxy is located
http_proxy  = "http://10.10.1.10:3128"
https_proxy = "https://10.10.1.11:1080"

# Define that the same proxy is handling both http and https requests
proxies = { 
  "http"  : http_proxy,
  "https" : https_proxy,
}

# Proxy Authentication
auth = HTTPProxyAuth("user", "pass")

# SSL/TLS Verification
verify_ssl = True

# Proxy Connection Timeout
timeout = 5.0

try:
    # Making a request through a proxy
    response = requests.get(endpoint, proxies=proxies, auth=auth, verify=verify_ssl, timeout=timeout)
    # Raise an exception if the request was unsuccessful
    response.raise_for_status()
except Exception as e:
    print(e)
```

#### With SSL Verification

When working over long timeframes with SSL/TLS certificates, there are also some other important considerations:

1. **SSL/TLS Certificate Validation**:
   - Verify the server's SSL certificate
   - Check the certificate chain

2. **Common Issues**:
   - Certificate validation errors
   - SSL/TLS handshake failures
   - Certificate expiration
   - Certificate revocation

3. **Best Practices**:
   - Always verify SSL/TLS certificates
   - Handle certificate validation errors gracefully
   - Monitor certificate status

#### Different SSL Approaches

```python
#no SSL verification
requests.get(endpoint, verify=False)

#Use default SSL verification
requests.get(endpoint, verify=True)

#Use custom SSL verification
requests.get(endpoint, verify=True, cert="cert.pem")
```

#### How to obtain a website's SSL certificate

1. Open the website in a browser
2. Click on the `i` or settings icon in the address bar
3. Click on the `Connection is secure` in the dropdown
4. Select  `Certificate is valid`

{{< img src="cert_dropdown.png" >}}

5. Go to the `Details` tab
{{< img src="ssl_cert.png" >}}
6. Select the top root certificate
7. Click on the `Copy to File` button
8. Select `Base64-encoded ASCII, certificate chain` file format and save the file
9. Move the file to the same directory as the script and rename it to `cert.pem`
10. Reference the file in the script with `cert="cert.pem"`

This will allow you to make requests over SSL/TLS without having to worry about the certificate. The certificate chain format allows you to submit the entire chain of trust from the root certificate to the server certificate.

### API Caching

API caching is a technique used to store and retrieve API responses to avoid `redundant requests`. This can be particularly useful when dealing with frequently accessed data or when working with large datasets.

It is also useful during development to avoid hitting rate limits or quotas and to speed up the development process. It can be extremely annoying to wait for a request to complete, especially when working with large datasets.

#### Storing API Requests in a Standardized Format

To efficiently store API requests and their responses, you can use a SQLite database. This allows you to keep a structured record of each request, which can be useful for debugging, analytics, or auditing purposes. Below is an example of how you can set up a SQLite database to store API requests:

To set up a SQLite database for storing API requests, you can follow these steps:

**Create a Database Connection**:
\
Use the `sqlite3` library in Python to connect to a SQLite database file. If the file does not exist, it will be created.

**Establish the Header Columns**:
  - Epoch time
  - Request Method (`Get, Post, etc.`)
  - Request Headers JSON
  - Endpoint
  - Query
  - Input Data
  - Response Code
  - Response JSON

**Create and Commit**

```python
import sqlite3

# Connect to the SQLite database (or create it if it doesn't exist)
connection = sqlite3.connect('api_requests.db')

# Create a cursor object using the connection
cursor = connection.cursor()

# Create a table to store API requests if it doesn't already exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS api_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_method TEXT NOT NULL,
    request_headers TEXT,
    endpoint TEXT NOT NULL,
    query TEXT NOT NULL,
    response_code INTEGER,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Commit the changes and close the connection
connection.commit()
connection.close()
```