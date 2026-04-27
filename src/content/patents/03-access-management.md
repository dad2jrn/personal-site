---
title: "System and method for access management for applications"
patentNumber: "US 12,086,648 B2"
filedDate: "2023-07-13"
grantedDate: "2024-09-10"
assignee: "Capital One Services, LLC"
inventors: ["Ron Meck"]
abstract: "A system that observes application behavior at execution time to dynamically drive IAM policies, ensuring least-privilege access based on actual API calls and resources touched."
usptoUrl: "https://patents.google.com/patent/US12086648B2"
---

### The Problem
In any cloud environment, applications get IAM roles that are way too permissive. Someone wrote the policy two years ago, the code has changed five times since, and nobody dares trim the permissions because if they break something the blame is on them. So permissions just accumulate. That's a security problem (excess blast radius), an audit problem, and a compliance problem.

### What I Invented
A system that watches what an application *actually does* against the cloud — the real API calls, the real resources touched — at execution time, then drives the IAM policy from that observed behavior. The application's own behavior becomes the source of truth for what permissions it should have. Existing access is reconciled against actual use. Unused permissions can be safely removed.

### Why it Matters to the Business
This is least-privilege done by the machine, not by humans guessing. It shrinks attack surface, makes audits straightforward, and removes the political friction that keeps teams from cleaning up old permissions. For a regulated institution, that's not a nice-to-have — it's the thing examiners ask about.