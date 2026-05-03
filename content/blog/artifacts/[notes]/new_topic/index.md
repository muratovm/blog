---
type: artifact
artifact_type: note
title:
date: 2025-09-18
categories:
  - ai
tags:
draft: false
image: default.png
layout: blog-post
toc: true
lastmod: 2026-03-29
description: New topic
slug: new-topic
---
## Problem statement 

The issue with MCPs at the moment is that a lot of practical design choices still fall on the developer, and that includes some important security decisions. MCP shines at standardizing tool access, but the safety boundary still lives in the host, client, and server implementation. In this post I’m going to use a small TypeScript policy gate as an exercise for thinking through those boundaries. We’ll look at concrete examples of MCP-style tool calls, where they can go wrong, and what kind of checks can catch them before they run.




    
2. **Five concrete failure cases**  
    List 5 agent/tool security failures:  
    prompt injection, sensitive data exfiltration, unsafe file access, over-broad tool permission, missing audit trail.  
    For each: one sentence “what goes wrong.”
    
3. **One policy example**  
    Draft a tiny policy table:  
    action, risk, default, requires confirmation?, audit log fields.  
    This becomes public-proof material fast.
    
4. **README skeleton**  
    Create headings only:  
    Problem, Threat Model, Policy Model, Examples, Non-Goals, Roadmap.  
    No prose except bullets.
    
5. **Build/leverage calibration**  
    For mcp-sentinel, write:  
    I should build myself: ___  
    I should learn from others: ___  
    I should reuse: ___  
    I should delegate to AI: ___  
    This directly attacks the “do everything from scratch” pattern.
    
6. **One public-facing paragraph**  
    Draft a short post: “The underrated problem with AI agents is not intelligence, it is tool authority.” Keep it under 150 words.
    
7. **Career translation bullet**  
    Write one resume/GitHub-profile bullet connecting bank/security automation to AI agent security. Evidence-based, no inflated AI language.
    
8. **One external signal**  
    Find one project, person, or article in MCP/tool security worth tracking. Capture why it matters and what you might learn from it.
