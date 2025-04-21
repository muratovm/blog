---
title: Why and How this Blog Works
date: 2025-04-20
lastmod: 2025-04-20
tags:
  - Web
draft: false
image: /img/banner/blog_structure.png
layout: blog-post
---

![image](../../../img/banner/blog_structure.png)

### Purpose

These days there's countless outlets for self-expression, whether through Facebook posts, Instagram stories, X threads, Substack articles, or YouTube videos. The list of social media platforms is so long that it would get tiresome to name them all.

But despite the diversity of options, there seems to be a common meta emerging across every single platform; catering to the most generic demographic of average daily visitors. It can be disheartening to create niche content for a select audience while surface-level channels gorge on the attention of millions. This would be alright on its own if not for the platforms themselves encouraging this type of behavior.

There's almost no room for a custom experience on social media platforms anymore. Ever since algorithmic recommendations took off, the platforms presenting our content stripped and sanitized themselves to make it easier for the algorithms to do their job. I'm sure this was done partially for safety reasons, and to ensure a mostly uniform viewer experience, the same way you might find comfort in visiting a chain restaurant where everything feels familiar. But it does clamp down on the type of content that can be shared.

In any case, the lack of control over the platform I'm using has always made me reluctant to contribute the necessary time and dedication to grow out my digital library. Making and hosting my own website has always been my preferred option. I've owned my name domain since 2018 c when I could have been developing it in conjunction with getting my CS degree.I've wrestled with how to approach it for years...indecision has left me with nothing to show for it.

If I could go back and change one thing, I would go back and shake enough sense into myself to start writing things down. But if I couldn't start then, I might as well start now.
 
The only promise I'm going to make is this:\
**This website is not for you, it's for me**

These articles could be created, reworded, moved around, or deleted at any moment. This isn't a website anymore it's my personal ***dumping ground***. The more life it has, the better.

Of course there's a reason why almost nobody does this. It would take up a lot of time and it would make no money. Probably lose money in the long run. Counter to what they might say, people like having a recommendation algorithm that serves them the best content of the day. They won't find that here.

I guess it’s a good thing I’m not making this site for people.

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

Currently I'm using the [Hugo Simple](https://github.com/maolonglong/hugo-simple/) theme and dumping all of my writing into sequential articles — meanwhile borrowing elements from other themes and my design choices ideas.

### Themes

### List vs Single Pages

### AWS Hosting

### Media