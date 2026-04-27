---
title: "Systems and methods to convert information technology infrastructure to a software-defined system"
patentNumber: "US 11,954,504 B2"
filedDate: "2022-07-14"
grantedDate: "2024-04-09"
assignee: "Capital One Services, LLC"
inventors: ["Ron Meck", "Daniel Safronoff", "James Hounshell", "Eric Schultz"]
abstract: "A system that analyzes existing cloud infrastructure and generates optimized alternative configurations as executable code, using a learning model to improve proposals over time."
usptoUrl: "https://patents.google.com/patent/US11954504B2"
---

### The Problem
Once you're in the cloud, the question stops being "should we use cloud?" and becomes "is the configuration we're running actually the right one?" Most organizations never revisit the answer. Infrastructure that was reasonable three years ago is now overprovisioned, underprovisioned, or simply structured wrong — but nobody has time to do the analysis and refactor it by hand.

### What I Invented
A system that looks at the existing infrastructure deployed in a cloud account, generates several alternative configurations as executable code, picks the one that best optimizes for whatever variable matters (cost, performance, resilience, etc.), deploys it, and then evaluates how it performed. A model trains on the outcomes so the next round of proposals gets smarter.

### Why it Matters to the Business
This is the hard part of cloud nobody talks about: the second mile. Going *to* the cloud is one project. Continuously *optimizing* what's there is a permanent operating discipline. This patent codifies a way to make that optimization a repeatable, learning system rather than a series of one-off engineering campaigns.