+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
lastmod = {{ .Date }}
description = "Add a one-sentence summary for SEO and previews."
slug = '{{ path.Base .File.Dir }}'
tags = []
categories = []
image = "default.png"
layout = "blog-post"
toc = true
draft = true
+++
