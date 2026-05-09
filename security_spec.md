# Security Specification: CareerBoost Basic

## Data Invariants
1. A user can only access their own data subtree (`/users/{userId}/**`).
2. The `tier` field is immutable after creation and defaults to `basic`.
3. The `usage` field can only be updated by the backend (administrative privileges) or strictly constrained if client-side (here, we delegate to backend for increments).
4. All document IDs must be valid string formats.
5. Critical fields like `createdAt` must be server-validated or immutable once set.

## The Dirty Dozen Payloads (Targeting Vulnerabilities)

1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to set `tier: "premium"` on creation.
3. **Ghost Field Injection**: Adding `isVerified: true` to a profile update.
4. **Data Scraping**: Attempting to list all resumes of another user.
5. **Usage Hijack**: Attempting to reset `usage.resumeAnalyses` to 0 via client SDK.
6. **ID Poisoning**: Creating a resume with a 2MB string as the ID.
7. **Resource Exhaustion**: Sending a massive 1MB string for a `notes` field.
8. **PII Leak**: Authenticated user trying to `get` another user's email.
9. **Orphaned Writes**: Creating a resume in a location not owned by the user.
10. **State Shortcut**: Updating a job application status to a forbidden value.
11. **Denial of Wallet**: Rapidly creating 10,000 empty job applications (rate limiting needed, but rules can restrict size).
12. **Timestamp Spoofing**: Setting `createdAt` to a date in 2030.

## Test Runner (Security Rules)
Tests will verify that these payloads return `PERMISSION_DENIED`.
