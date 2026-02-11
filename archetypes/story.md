+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
lastmod = {{ .Date }}
description = "One-line summary: thesis + why it matters."
slug = '{{ path.Base .File.Dir }}'
tags = []
categories = []
image = "default.png"
layout = "blog-post"
toc = true
draft = true
kind = "story"
status = "draft"
publish_section = "stories"
thesis = ""
impact = ""
evidence = []
from_artifacts = []
+++
