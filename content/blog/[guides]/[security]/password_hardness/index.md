---
title: Password Hardness
date: 2025-05-16
lastmod: 2025-05-16
categories:
  - security
  - statistics
tags:
  - passwords
draft: false
image: password_hardness.png
layout: blog-post
toc: true
---

Most people either **overestimate** or **underestimate** their password's strength.

Let’s break it down simply: password strength comes from **entropy**—the number of possible combinations an attacker has to try.

We’ll define four **tiers** of password complexity, then let you test yours directly at the bottom of the post.

### Tier 1: The Usual Suspects

These passwords are the most common and easiest to crack. Often used by people who either don’t care about security or are unaware of the risks, for example children, the elderly or people who are sleepwalking through life.

> [!example]Examples
> password!, 123456, qwerty, admin, incorrect

`Attack method`:\
Dictionary + pattern matching

`Cracked in`:\
Milliseconds to Seconds

`Strength`: \
Can be used for things you don't care about and want to lose.

`Downside`: \
If you use these passwords for anything important, you’re asking for trouble. They are the first ones an attacker will try.

### Tier 2: The Daily Driver

> [!example]Examples
> Summer@2023, Passw0rd$, LetMeIn!

`Attack method`:\
Hybrid attacks (dictionary + substitutions)

`Cracked in`:\
Minutes to Days

`Strength`: \
It's better than Tier 1, but not by much. It’s a good choice for things you don’t care about too much, but you'd be inconvenienced if you lost them.

`Downside`: \
If you use these passwords for anything important, you’re still asking for trouble. If someone wants to get into your account, it won’t take them long.

### Tier 3: I Take Security Seriously

> [!example]Examples
> correct-horse-battery-staple, Goose-Coffee-Window-3

`Attack method`:\
Wordlist permutations

`Cracked in`:\
Weeks to Years

`Strength`: \
Easy to remember, hard to crack. This is a good choice for most things, especially if you use a new one for each account.

`Downside`: \
Can be hard to remember all of them if all your passwords are like this.

### Tier 4: I Don't Have it Memorized

> [!example]Examples
> Tg5v!3M#fL9@bZ1$

`Attack method`:\
Brute force only

`Cracked in`:\
Decades (if long enough)

`Strength`: \
Good enough to use for anything. This is the kind of password you want to use for your most important accounts, like banking or email. Incredibly hard to crack.

`Strength`: \
Hard to remember without a password manager which introduces a new risk: if you lose access to your password manager, you lose access to everything.

{{< password_generator >}}

>[!Warning]
> This checker only takes into account the entropy of the password itself. It does not take into account the presence of dictionary words, common patterns, the security of the site you are using it on, or any other factors that may affect the strength of your password.

For a more accurate assessment of your password's strength, consider using a password manager that includes a `password strength checker`. These tools can help you generate strong passwords and store them securely.

### Additional Resources

- [Advanced Password Hardness Calculator](https://lowe.github.io/tryzxcvbn/)
- [Password Hardness Repository](https://github.com/dropbox/zxcvbn?tab=readme-ov-file)