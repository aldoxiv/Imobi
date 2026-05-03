# Security Specification - Imobi Real Estate Portal

## Data Invariants
1. **User Profiles (`/users/{userId}`)**: 
   - Every user has a unique profile bound to their UID.
   - Users can only read and write their own profile data.
   - The `role` field determines the level of access (client, agent, admin).
   - Only admins can change a user's role.

2. **Properties (`/properties/{propertyId}`)**:
   - Properties are public for reading.
   - Only users with `agent` or `admin` roles can create properties.
   - An agent can only update or delete properties where they are the assigned `agentId`.
   - `agentId` is immutable after creation.

3. **Inquiries (`/inquiries/{inquiryId}`)**:
   - Any authenticated user can create an inquiry for a property.
   - The inquiry must link to a valid property.
   - Only the inquirer (`userId`) or the listing agent (`agentId`) can read the inquiry.
   - Only the listing agent can update the inquiry `status`.

## The Dirty Dozen Payloads (Red Team Tests)

| # | Attack Type | Payload/Action | Expected |
|---|---|---|---|
| 1 | Identity Spoofing | `create` /properties/p1 { agentId: "another_user" } | DENIED |
| 2 | Privilege Escalation | `update` /users/me { role: "admin" } | DENIED |
| 3 | Ghost Fields | `update` /properties/p1 { title: "Luxury", unknown_field: "hacked" } | DENIED |
| 4 | Resource Poisoning | `create` /properties/p1 { title: "A" * 1000, ... } | DENIED |
| 5 | Invalid ID | `get` /properties/..%2F..%2Fsys | DENIED |
| 6 | Immutable Bypass | `update` /properties/p1 { agentId: "new_agent" } | DENIED |
| 7 | Unverified Write | `create` /properties/p1 while email_verified=false | DENIED |
| 8 | Direct Read (PII) | `get` /inquiries/other_inquiry (as non-participant) | DENIED |
| 9 | Relational Sync Failure | `create` /inquiries/i1 { propertyId: "non_existent" } | DENIED |
| 10| State Shortcut | `update` /inquiries/i1 { status: "closed" } (as inquirer) | DENIED |
| 11| PII Blanket Leak | `list` /users/ | DENIED |
| 12| Shadow Record | `create` /users/random_uid { email: "attacker@evil.com" } | DENIED |
