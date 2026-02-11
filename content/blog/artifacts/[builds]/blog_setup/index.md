---
title: How this Blog Works
description: Setup notes for this Hugo blog, including tooling, deployment, and workflow.
date: 2025-04-22
lastmod: 2026-02-10
slug: how-this-blog-works
aliases:
  - /blog/builds/how-this-blog-works/
categories:
  - cloud
  - web
tags:
  - hugo
draft: false
image: blog_structure.png
layout: blog-post
toc: true
---

The structure of this site is simple.
### Hugo Static Generator

I use a static site generator called Hugo: [Hugo Quick Start](https://gohugo.io/getting-started/quick-start/)

```bash
sudo apt install hugo

hugo new site michaelmuratov.com
cd michaelmuratov.com

hugo server

                   | EN  
-------------------+-----
  Pages            |  1  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  1  
  Processed images |  0  
  Aliases          |  0  
  Cleaned          |  0  

Built in 10 ms
```

The site consists of three quality of life features that would be non negotiable for this kind of project. 

1) GIT Version Control
2) Obsidian Rich Text Editor
3) AWS CI/CD Pipeline

### Version Control

Version control is pretty important for a site like this. For one it keeps a consistent backup of my files on an external server, while giving me the freedom to modify my files offline. There are other benefits that git provides as a version control system such as reliable metrics for commit times and native CI/CD functionality for building the static site. The build at commit functionality allows me to  track only Markdown file changes, which are easy to read and edit. 

![image](git.png)
### Text Editor

Because most of the files on this site are written in Markdown, they can be viewed and edited in nice rich text editors like Obsidian. The integration between Obsidian and Hugo doesn't exist directly but I've been able to port common elements such as code snippets and call outs.

{{< img 
    src="obsidian_editor.png"
    class="png"
>}}
### AWS Integration

![CI/CD](ci_cd.png)

Learning a cloud platform like AWS has been on my priority list this year. In addition the existence of dedicated services like **AWS Amplity** makes it fairly cost efficient to host the website myself and monitor spending on all my cloud services through a unified interface. AWS does fall short in terms of identifying usage metrics but I've augmented the website with Google Analytics tags that fills in for that gap.

My domain name is registered on Squarespace but I don't want to use them for hosting because I find their fees too expensive for my no name blog.  

Instead I set up a Hosted Zone for my domain on Amazon's Route 53. Amazon will use its name servers to map my domain to their external IPs:

![AWS Name Servers](aws_nameservers.png)

All I have to do is enter the name servers I was assigned to my Squarespace Domain Nameservers list.  

![Square Space Name Servers](squarespace.png)


This setup allows me to own my domains on Squarespace and manage them from AWS.

The hosting itself is defined by a direct relationship between AWS Amplify and your version control system in this case Github.

![image](github.png)

Every time I make a commit on Github the CI/CD pipeline syncs the changes to the AWS instance and runs a prebuild command to generate the static files.

![image](prebuild.png)

The version control, rich text editor and cloud deployment make this blog setup seamless, cost efficient and salable with minimal setup.

### Theme and Visual System

This site started on [Hugo Simple](https://github.com/maolonglong/hugo-simple/) and has now diverged into my own custom theme (`themes/muratov`) with project-specific layouts and styling.

The front page is organized into:

- A **Latest Feature** card
- A curated **Pinned** section
- **Explore by Track** (Builds, Guides, Notes)
- **Recent Activity** and **Recently Updated**
- A dedicated **Archive** entry point

Two status-oriented UI components near the top:

- **In Progress**: the current focus and target date
- **Momentum**: weekly publishing/edit counts and an 8-week sparkline trend

Giscus comments were added to make it easier for readers to engage with the content.

### Metadata

Each post has associated metadata to inform Hugo on how to display the page and what category to group it under.

```markdown
---
title: How this Blog Works
date: 2025-04-22
lastmod: 2025-04-20
tags:
  - Web
draft: false
image: blog_structure.png
layout: blog-post
---
```

This format is very flexible and it lets me specify the file structure that the site will use to generate the page, directly in the Markdown file.

All layout files are customizable with the Hugo styling language to order page elements in unique configurations such as individual post layouts, lists of links to other posts, etc.

### Analytics

To track usage on this website I made use of Google Analytics, which the most powerful set of tools for web monitoring and is completely free. Every page I want to track needs to contain the following **Google Tag**:

```js
<!-- Google tag (gtag.js) -->

<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y9QJ4EB3PT"></script>

<script>

window.dataLayer = window.dataLayer || [];

function gtag(){dataLayer.push(arguments);}

gtag('js', new Date());
  

gtag('config', 'G-Y9QJ4EB3PT');

</script>
```

This tag is included in the `baseof.html` template of every single page that Hugo generates:

```
{{ partial "google-analytics.html" . }}
```

Ensuring that every individual blog post and site page will feature a tag that links usage data to Google's server and my dashboard. 

![image](google_analytics.png)
