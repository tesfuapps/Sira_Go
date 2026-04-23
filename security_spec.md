# SiraHub Security Specification

## 1. Data Invariants
- A user profile must belong to the user attempting to access it (except for admins reading it).
- A job must be tied to a valid `employerId` matching the currently signed-in user's UID (upon creation).
- A user cannot change their own `role` safely (must be blocked in profile creation/update).
- Only an `admin` can approve or reject jobs.
- Anyone can read `Approved` jobs.
- Only the `employer` (who owns the job) or an `admin` can read `Pending` or `Rejected` jobs.

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a job where `employerId` != `request.auth.uid`.
2. **Privilege Escalation**: Attempt to create/update user profile with `role: "admin"`.
3. **Array Explosion**: Try to store 10,000 string elements in an unrestricted array (mitigated by using `savedJobs` subcollection instead).
4. **Data Over-fetching**: Attempting a `list` query on `/jobs` without filtering out `status != 'Approved'` as an unauthenticated or non-admin user.
5. **State Skipping**: An employer attempting to update a job's `status` from `Pending` directly to `Approved`.
6. **Orphaned Writes**: Creating a job without ensuring an existing `User` record exists with `role == 'employer'`.
7. **Type Poisoning**: Attempting to set `applyMethod.value` as a boolean instead of a string.
8. **Size Flooding**: Attempting to set `job.description` to a 500KB string payload.
9. **Role Modification via Shadow Update**: Passing a valid update but sneaking in `role: "employer"` to change a seeker profile.
10. **ID Poisoning**: Accessing `/users/{userId}` with an ID that contains massive repetitive junk chunks.
11. **PII Blanket Read**: Querying `/users/` list directly.
12. **Malicious Timestamp**: Updating a job but modifying the `createdAt` value instead of retaining it.

## 3. Test Runner
*(Will be written in `firestore.rules.test.ts` to assert that all aforementioned dirty payloads get rejected with PERMISSION_DENIED)*
