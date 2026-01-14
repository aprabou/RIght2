Feature: LinkedIn Connections Import (User-Provided CSV)
1. What This Feature Is

A one-time (or infrequent) LinkedIn connections import that allows users to upload their LinkedIn-exported connections CSV so the platform can:

Build a user-scoped professional network graph

Match job postings to warm connections at target companies

Surface “who you know” alongside scraped job listings

This feature does not connect to LinkedIn via API, does not scrape LinkedIn, and does not auto-sync. All data is user-provided and user-controlled.

2. Why This Exists (Product Intent)

LinkedIn does not expose connections or mutuals via API

Users value warm introductions more than raw job listings

Manual CSV import is the only compliant way to access this data

Once imported, the data can power multiple downstream features

This feature is foundational infrastructure, not a one-off UI.

3. High-Level Architecture Impact
New Systems Introduced

Connection Import Pipeline

User-Scoped Network Store

Job ↔ Connection Matching Engine

Affected Areas

Auth / onboarding

File upload handling

Data normalization layer

Job ingestion & enrichment

UI components for job detail views

Privacy / data deletion workflows

4. Data Model (Conceptual)
UserConnection (per user, not global)

user_id

connection_name

company_name_raw

company_name_normalized

job_title_raw

job_title_normalized

connection_date

source = “linkedin_csv”

last_updated_at

Important constraint

Connections are never shared across users

No global graph

No mutual calculations

5. User Stories
Core User Stories

As a job seeker, I want to upload my LinkedIn connections so I can see who I know at companies I’m applying to.

As a user, I want to upload my connections once and not be asked again unless I choose to refresh.

As a user, I want to know when my connections data is outdated.

As a user, I want to delete my uploaded connections at any time.

Edge / Control Stories

As a privacy-conscious user, I want to understand exactly what data is used and why.

As a user, I want to exclude specific connections or companies from appearing.

As a user, I want to re-upload a newer file to replace the old one.

6. User Flows
Flow A: First-Time Setup

User signs up / logs in

User views job listing

System detects no connections data

Inline prompt appears:

“See if you have connections at this company”

CTA: “Connect LinkedIn (2-minute setup)”

User clicks → modal explaining:

Manual CSV upload

One-time setup

No LinkedIn login required

User uploads CSV

Backend parses + stores data

UI updates immediately with:

“You have X connections at Company Y”

Flow B: Job Detail View (Post-Import)

User opens a job post

Job data is already scraped

Matching engine runs:

job.company ↔ user.connections.company

UI displays:

Connection count

Names + roles (optional, privacy-aware)

Optional CTA:

“Request intro”

“Save connection”

Flow C: Refresh / Re-Upload

User opens settings → “Connections”

Sees:

Last updated date

Connection count

Clicks “Update connections”

Upload replaces prior dataset atomically

Flow D: Deletion / Opt-Out

User clicks “Delete connections”

Confirmation modal

All connection records for user are removed

Job pages revert to “Upload to see connections”

7. Backend Implementation Details
CSV Ingestion Pipeline

Validate file:

Expected columns (name, company, title)

Size limits

Normalize:

Company name canonicalization

Title standardization

De-duplicate:

Same name + company + title

Persist per user

Mark import timestamp

Critical rule

Never enrich missing fields via LinkedIn or scraping

Matching Logic (Job ↔ Connection)

Input:

Job.company_name

Job.role

Match:

Exact or fuzzy company match

Optional role proximity scoring

Output:

Ranked list of relevant connections

This logic should be abstracted so it can later support:

Referrals

Outreach templates

CRM-like features

8. Frontend / UX Requirements
Onboarding UI

Clear explanation of manual step

Emphasis on “one-time”

Explicit privacy disclosure

Job Card / Job Page

“Connections at this company” module

Empty state when no data exists

Lightweight refresh indicator

Settings Page

Upload / replace

Last updated timestamp

Delete data option

9. Privacy & Compliance Requirements

Must include:

Explicit user consent before upload

Clear statement:

Data is user-provided

Not shared

Deletable at any time

No background syncing

No cross-user aggregation

No LinkedIn branding implying API partnership

10. Non-Goals (Explicitly Out of Scope)

Automated LinkedIn syncing

Mutual connection discovery

Messaging or outreach via LinkedIn

Global social graph

Contact enrichment from external sources

11. Future Extensibility (Designed-For)

This feature should be built so it can later power:

Referral request workflows

Intro ranking algorithms

Company warm-intro heatmaps

Multi-source imports (e.g., Google Contacts)

12. Summary for Engineers

This feature is a compliant workaround to a closed API, not a hack.

Key principles:

User-initiated

One-time by default

User-scoped data

High leverage across product

If implemented cleanly, this becomes core infrastructure, not a throwaway feature.