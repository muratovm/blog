---
type: artifact
artifact_type: note
title: Setting up and MCP Policy Gate
date: 2025-09-18
categories:
  - ai
tags:
draft: false
image: default.png
layout: blog-post
toc: true
lastmod: 2026-03-29
description: Thinking through security boundaries in MCP
slug: mcp-policy-gate
---

### Problem statement 

The issue with MCPs at the moment is that a lot of practical design choices still fall on the developer, and that includes some important security decisions. MCP shines at standardizing tool access, but the safety boundary still lives in the host, client, and server implementation. In this post I’m going to use a small TypeScript policy gate as an exercise for thinking through those boundaries. We’ll look at concrete examples of MCP-style tool calls, where they can go wrong, and what kind of checks can catch them before they run.
