---
title: How this Blog Works
date: 2025-04-20
lastmod: 2025-04-20
tags:
  - Web
draft: false
image: /img/banner/blog_structure.png
layout: blog-post
---

![image](../../../img/banner/blog_structure.png)


### Hugo Static Generator

The structure of this site is simple.

I use a static site generator called Hugo: [Hugo Quick Start](https://gohugo.io/getting-started/quick-start/)

```
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

The site consists of three quality of life features that would be non negotiable for this kind of enterprise. 

1) GIT Version Control
2) Obsidian Rich Text Editor
3) AWS CI/CD Pipeline

Currently I'm using the [Hugo Simple](https://github.com/maolonglong/hugo-simple/) theme and dumping all of my writing into sequential articles — meanwhile borrowing elements from other themes and my own design choices.

### Themes

### List vs Single Pages

### AWS Hosting

### Media