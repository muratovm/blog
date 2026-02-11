+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
lastmod = {{ .Date }}
description = "Working note, experiment log, or reference artifact."
slug = '{{ path.Base .File.Dir }}'
tags = []
categories = []
image = "default.png"
layout = "blog-post"
toc = true
draft = true
kind = "artifact"
status = "draft"
publish_section = "artifacts"
thesis = ""
impact = ""
evidence = []
from_artifacts = []
+++
