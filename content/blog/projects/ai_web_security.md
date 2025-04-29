---
title: AI Web Security Lab
description: Launching my AI Web App Security Lab — Here’s Why and What I’m Building
date: 2025-04-29
categories:
  - ai
  - cloud
  - security
tags:
  - python
  - fast api
draft: false
image: /img/banner/secure_ai_wrapper.png
layout: blog-post
toc: true
---


>[!Important]
> Securing an AI Wrapper requires a multifaceted and hybrid approach — that can be implemented in many different ways.\
\
This article will not be a comprehensive guide to securing your AI wrapper but rather an overview of general principles.

### Goals

1. Create a secure web wrapper for an LLM model, adhering to modern security principles.
2. Open source a security checklist used to stress test this implementation.

This project serves as the intersection between `3` areas of interest for me — scalable cloud computing, cyber security, and artificial intelligence. The goal is to implement the `product` and the `testing` methodology required to secure it.

The success of the project hinges on the completion of the following objectives:

- Infrastructure as Code Deployment
- Microservices Centered Implementation
- Scalable Architecture
- Secure Web Interface
- User Authentication with SSO and MFA
- Input Validation
- Automated Testing Suite

### Resources

- AWS Cloud Resources:
  - `[Front-end]` HTML / JS 
  - `[Back-end]` Fast API 
  - `[Authentication]` AWS Cognito 
  - `[AI Framework]` Amazon Bedrock 
  - `[Conversations]` Amazon RDS 
  - `[Files]` Amazon S3
  - `[Deployment]` AWS Cloud Formation 
- AI Model:
  - `[Open Source Model]` Llama v3 
- Testing Toolkit:
  - `[SQL]` SQLmap
  - `[Endpoints]` Nikto
  - `[Web Interface]` BurpSuite
  - `[Web Interface]` ZAP

### Web

The front-end, and back-end of the application will feature basic components such as authentication, input fields, and file submission. The point of the exercise is not to stress test new and complex web features, but rather to expose basic and common features that are frequently exploited by attackers. 

### Cloud

Cloud deployments can often be complex, and just like with web development there is no one-size-fits-all approach or common standard used in the industry. Instead, this project will focus on using features native to the cloud environment, such as infrastructure as code, micro services and managed products that will both streamline development and showcase built-in security features.  

### AI Model

The choice of AI model is the least important aspect of this project, and rather the focus is on building a system where the AI model can be swapped in and out as models improve, and increasingly become a commodity.

### Testing

The testing toolkit will grow over time as the project matures to include testing of the cloud infrastructure, the web component, and various aspects of MITRE ATLAS for AI model hardening.

### Full Architecture

{{< img src="/img/diagrams/ai_web_security-full_diagram.png" >}}

