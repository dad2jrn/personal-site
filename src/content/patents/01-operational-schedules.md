---
title: "Tag-Driven Cloud Cost Automation"
patentNumber: "US 10,951,542 B2"
filedDate: "2019-07-15"
grantedDate: "2021-03-16"
assignee: "Capital One Services, LLC"
inventors: ["Ron Meck"]
abstract: "A system for driving the on/off behavior of cloud resources automatically using metadata tags as the control mechanism, ensuring resources only bill when in use."
tags: ["FINOPS", "CLOUD GOVERNANCE", "AUTOMATION"]
usptoUrl: "https://patents.google.com/patent/US10951542B2"
---

### The Problem
In a large enterprise cloud, thousands of resources — dev environments, test instances, sandboxes, batch workers — sit idle for big chunks of every day, every weekend, every holiday. They're still billing. Multiply that by the footprint of a Fortune 100 bank and you're burning real money on compute that nobody is using.

### What I Invented
A way to drive the on/off behavior of cloud resources automatically, using metadata tags as the control mechanism. Instead of someone manually shutting things down, the resources themselves carry the schedule with them, and the system enforces it — including restoring whatever state they were in when they need to come back online.

### Why it Matters to the Business
Direct, recurring cost savings on cloud spend. Better governance, because the rules are codified into the resources rather than living in someone's head or a spreadsheet. And it scales — once the pattern is in place, it works whether you have a hundred resources or a hundred thousand.