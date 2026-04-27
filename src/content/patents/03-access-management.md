---
title: "System and method for access management for applications"
patentNumber: "US12086648B2"
filedDate: "2023-07-13"
grantedDate: "2024-09-10"
assignee: "Capital One Services, LLC"
inventors: ["Ron Meck"]
abstract: "A system for managing application access by scanning code at execution time to identify required actions and resources within a cloud environment, then validating these against existing permission sets."
usptoUrl: "https://patents.google.com/patent/US12086648B2"
---

### Plain English Summary
This patent describes a smarter way to handle security permissions for cloud applications. Usually, developers have to manually guess which permissions an app needs, which often leads to giving too much access (a security risk) or too little (causing the app to crash).

This invention automates that process. When an application starts running, the system "scans" the code to see exactly what actions it's trying to perform and what data it's trying to touch. It then compares these needs against the security rules in real-time. This ensures that applications have exactly the access they need to function—no more, no less—greatly strengthening the overall security of the cloud environment.

### Key Innovation
The use of "execution-time scanning" to dynamically identify and manage application permissions, moving away from static, manual, and error-prone security configurations.