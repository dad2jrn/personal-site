---
title: "Computer-based systems configured for automated roll-forward of software"
patentNumber: "US11157269B2"
filedDate: "2020-06-08"
grantedDate: "2021-10-26"
assignee: "Capital One Services, LLC"
inventors: ["Ron Meck"]
abstract: "A system for detecting failures in software packages and automatically rolling forward to a stable version. It extracts data from a release directory and uses a base repository to facilitate automatic updates in response to detected failures."
usptoUrl: "https://patents.google.com/patent/US11157269B2"
---

### Plain English Summary
This patent addresses the critical challenge of software deployment failures. Traditionally, when a new software update fails, systems "roll back" to the previous version. However, in complex modern environments, rolling back can sometimes cause more issues than it fixes.

This invention introduces an "automated roll-forward" mechanism. When the system detects a failure in a new software package, it doesn't just revert; it intelligently identifies the necessary components for a stable state and automatically pushes the system forward to a known good configuration. This ensures higher availability and reduces the manual intervention required during failed deployments.

### Key Innovation
The shift from reactive "roll-back" strategies to proactive "roll-forward" automation, allowing systems to recover from deployment failures by advancing to a stable state rather than just retreating to the past.