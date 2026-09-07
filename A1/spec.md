# Assignment 1: Initial Thoughts and System Design (A1)

**QueueSmart – Smart Queue Management Application**
**Due: 09/18/2026 · Design only, no code · One submission per group · No extensions**

## Description

Develop the initial design for the software application the team will build over the semester. Focus on thinking and design, not coding: describe the problem, key features, development approach, and a high-level system architecture.

## Problem Statement

Many organizations (student service centers, clinics, advising offices, help desks) struggle with long queues and poor visibility into wait times. Users often do not know how long they will wait, and staff have limited tools to manage demand efficiently.

QueueSmart is a web or mobile application that helps:

**Users**
- Join a queue or book an appointment
- View their position and estimated wait time
- Receive notifications when their turn is approaching

**Administrators**
- Create and manage services
- Monitor queues and priorities
- Improve overall service efficiency

## Application Requirements

1. **Login and Registration** — users and admins register; basic auth via username/email + password; email verification (design only)
2. **User Roles** — User: join queues, view status, receive notifications. Administrator: create services, manage queues, view usage data
3. **Service Management (Admin)** — create services with: name and description, expected service duration, priority level (low/medium/high)
4. **Queue Management** — users join/leave a queue; view current position and estimated wait time; queue ordering based on arrival time and priority
5. **Notifications** — notify users when close to being served or when queue status changes; email or in-app (design choice)
6. **History** — track user queue participation history; admins view basic usage statistics

Teams may design either a web application or a mobile application using any tools/technologies.

## Questions to Answer

### 1. Initial Thoughts (2 points)
- Who are the main users of the system?
- How will users and administrators interact with the application?
- What are the most important features?
- What challenges do you anticipate (e.g., long queues, notifications, inaccurate wait times)?

### 2. Development Methodology (2 points)
- Which methodology will you follow (e.g., Agile, Scrum, Waterfall)?
- Why is this methodology appropriate for this project?
- How will this approach help the team work across multiple assignments?

### 3. High-Level Design / Architecture (6 points)
Must include an architecture diagram and a brief explanation of how the major components interact.

**Required (all teams): System Context Diagram** showing:
- The main users (User and Administrator)
- The QueueSmart system as a single unit
- Any external systems the design depends on (e.g., Email or SMS service)

Purpose: clearly define what is inside the system, what is outside, and how users/external systems interact with QueueSmart. High-level and simple — no frameworks, languages, or APIs.

**Optional (encouraged): Container Diagram** showing major internal parts:
- Front-end (Web or Mobile)
- Back-end / API
- Database
- Notification component

Keep it simple; do not model microservices or low-level components.

**Diagram expectations:** one clear diagram is sufficient for full credit; readable and clearly labeled; clarity over complexity; no single "correct" architecture. Avoid framework-specific diagrams, overly detailed technical diagrams, and copying diagrams from online sources. If unsure, a System Context Diagram alone meets the requirements.

## Helpful Resources
- What is software architecture? (Atlassian): https://www.atlassian.com/software-development/software-architecture
- C4 Model: https://c4model.com
- Diagrams.net (Draw.io): https://app.diagrams.net · Figma: https://www.figma.com · Lucidchart: https://www.lucidchart.com

## Team Contribution Requirement (IMPORTANT)

Clearly document each member's contribution. **TAs verify contributions using GitHub history. Members without meaningful contributions receive a ZERO.**

| # | Group Member Name | What is your contribution? | Discussion Notes |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |

## What to Turn In
- One soft-copy submission (PDF or Markdown)
- Upload to Canvas or GitHub; if GitHub, provide the repo link in Canvas and ensure TAs have access
- Only one submission per group · No extensions · All members contribute equally

## Important Notes
- Design only — no code
- Design decisions carry forward to: **A2 – UI/UX Design, A3 – API Design, A4 – Data Design, Final Project & Demo**
