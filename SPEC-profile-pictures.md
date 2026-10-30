# Shared profile pictures

One Auth-managed picture is used by Auth, Mail, and Rok, including Mail sender pictures for known ter.net.in members. Auth provides upload, square crop/zoom, replace, and remove controls with an initials fallback. Pictures are visible to signed-in Auth members and are never an indicator that an email's sender has been verified.

## Contract and data

- Auth owns one bounded 256×256 WebP per user in the existing PostgreSQL database. An additive `profile_picture` table references the Auth user with cascade deletion. Store the small encoded image, its content hash, and modification date; use existing database persistence/backups. Removal deletes the stored image.
- `PUT /api/profile-picture` accepts JPEG, PNG, or WebP bytes, capped at 1 MiB after the browser crop. Authenticate and derive the owner from the session; require the exact Auth Origin and `X-Profile-User` matching that session to reject a stale account editor; rate-limit mutations. Decode with a pixel limit, re-encode to WebP, strip metadata. Invalid input and rejected writes preserve the previous picture. Uncertain responses retain the crop and offer retry without claiming an update succeeded.
- `DELETE /api/profile-picture` removes only the signed-in user's image with the same Origin/session checks.
- `GET /api/profile-pictures/:authSubject` serves the image to signed-in members, with private revalidation, an ETag, same-site resource policy, and no MIME sniffing. Missing images return404 and initials remain visible. No public directory or email lookup is exposed.
- OIDC `profile` claims provide the stable first-party picture URL. Consumer apps resolve legacy sessions using the existing provider-bound subject, never by matching OAuth email addresses. No new credentials, scopes, or implicit account linking.
- Mail adds optional image URLs to its current-user and sender address data. Resolve local senders from active mailbox ownership plus stored `ternetin` provider accounts, in a bounded batch. Keep full sender addresses visible. No arbitrary remote-image fetches or change to received message rendering.
- Rok shows the shared picture and an Auth profile link for the account. Existing Google and ter.net.in sign-in workflows remain available.

## Structure and implementation order

1. Auth picture storage/processing and tests; generated additive Drizzle migration.
2. Auth HTTP handlers and profile editor; use the shared source-owned Avatar component.
3. Mail provider-subject directory, sender enrichment and UI; Rok profile endpoint and account UI.
4. Review, CI, provider-first deployment, production verification.

Pure processing/handler tests live in `packages/auth/test`; database integration tests use the repository's existing PostgreSQL setup. UI helpers stay in the web app. Formatting follows the existing two-space, single-quote, semicolon-free Auth code. For example: `const url = new URL('/api/profile-pictures/' + encodeURIComponent(userId), origin)`.

## Verification and commands

`bun install --frozen-lockfile --ignore-scripts`; `bun run lint`; `bun run typecheck`; `bun test`; `bun run db:migrate`; `bun run build`; `bun audit --audit-level=high`. Run focused tests before each implementation slice. Extend CI so the new security and storage tests are required. Browser tests cover selection/crop/save/remove/error preservation, initials, own and sender images, refresh, light/dark, and mobile/desktop. Verify real protected routes and the additive migration as well as frontend fixture workflows.

## Boundaries and acceptance

Use existing shared component geometry. Preserve existing account, mailbox, invite, OAuth, and tunnel workflows. Never log pictures, tokens, credentials or message contents; never read/stage private environment files; preserve unrelated worktrees. No new hosting service, public avatar directory, external avatar provider, contact database, email-client avatar promises, or destructive schema change. The feature is complete when all three apps are deployed and their profile workflows and access boundaries are verified.
