# Shared account pictures

Every account can manage its picture at `/dashboard#profile`: choose a JPEG, PNG, or WebP, adjust the square crop with the zoom and position sliders, then save. Replace and remove use the same card. A failed save keeps the selected crop available for retry.

The same picture appears in Auth, Mail, and Rok. Mail also shows pictures for senders whose active local mailbox has one bound ter.net.in identity. A picture does not verify the sender of an email. Missing pictures and unavailable Auth sessions show initials.

## Storage and access

The additive `0001_dark_venom.sql` migration creates `profile_picture` in the existing Auth PostgreSQL database. Each user has at most one 256×256 WebP; the row is deleted with the account. Existing PostgreSQL persistence and backup procedures cover these rows. No object store or new production secret is needed.

The editor accepts originals up to 10 MB and 25 million pixels, crops locally, and uploads only the square image. The server independently caps uploads at 1 MiB and 4,194,304 decoded pixels, validates JPEG/PNG/WebP bytes, honors orientation, and strips metadata while re-encoding. Animated and unsupported images are rejected.

`PUT` and `DELETE /api/profile-picture` require the Auth session, its exact Origin, and `X-Profile-User` matching the session user. The owner always comes from the session. Mutations are rate limited; concurrent image processing is bounded.

`GET /api/profile-pictures/:authSubject` requires a signed-in Auth member. Responses are private and revalidated with ETags, with same-site resource isolation and MIME sniffing disabled. Anonymous requests receive 401; missing pictures receive 404. The URL is stable across replacement. It is not a public avatar API or an email directory.

OIDC user-info and ID-token `picture` claims use this first-party URL only when `profile` is granted. Consumers resolve existing sessions from the saved `ternetin` provider subject, without new email-based account linking. Returning to an app refreshes visible avatars after an edit in Auth.

## Release and rollback

1. Pass Auth CI, including image/security/storage tests, the real-database browser workflows, and the production container build.
2. Merge Auth first. Its existing deployment runs `bun run db:migrate` before starting the new web container.
3. Verify deployment success, anonymous picture GET returns 401, and the dashboard still redirects anonymous visitors to sign-in.
4. Deploy the Mail and Rok consumers, then verify their health, account identity, sender pictures, and initials fallback. Frontend fixture tests do not send real mail or create real CLI tokens.

If the release needs reverting, redeploy the preceding successful application commit through the existing deployment workflow. Leave the additive picture table and stored pictures intact; the previous application ignores them. Consumer rollback can happen independently. Do not drop the table or restore an older database merely to remove this UI.

## Development verification

Use an isolated PostgreSQL database, apply migrations, then run `bun test`, `bun run typecheck`, `bun run lint`, `bun run build`, and `bun audit --audit-level=high`. Run `PROFILE_TEST_DATABASE=1 bun run test:browser` against an explicitly configured loopback test database. The browser fixture refuses other hosts and uses disposable `profile-browser-…@example.invalid` invitations/accounts, which it cleans up.

The complete contract is in [SPEC-profile-pictures.md](../SPEC-profile-pictures.md).

The observed visual rules are recorded in the scoped [profile design notes](profile-pictures/DESIGN.md).
