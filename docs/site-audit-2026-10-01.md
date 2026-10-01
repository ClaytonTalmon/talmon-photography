# Website language and security review — 1 October 2026

Scope: the current website, collector request/invitation/acquisition flow, mailing list, Studio Editor, and Collection Editor integration. Source review, isolated API tests, generated-site checks, dependency audit, and read-only production checks. No real requests, invitations, subscriptions, prices, or sales were created or changed during the review.

## Language coverage

English, French, Spanish, Italian, German, Japanese, and Simplified Chinese each generate 71 pages: 497 localized pages in total. Every language has the same route set. Generated internal links and image/script references resolve. All localized pages have a footer, with no section, main element, or second footer after it.

Main dictionaries, collection descriptions, Process captions, collector forms, and collector email copy were checked for translation coverage. Collector translations preserve dynamic placeholders such as edition numbers and expiry dates. A comparison found no shared English body paragraphs across the translated main pages; artwork names, collection names, and the studio name intentionally remain unchanged. These are technical coverage and copy-consistency checks, not independent native-speaker certification.

Changes:
- Localized the Home page title and navigation accessibility labels.
- Added missing public error translations.
- Preserved the selected photograph/collection when changing language. Only public context is copied; passwords, approval tokens, and subscription tokens are excluded.
- Removed subscription confirmation/unsubscribe tokens from the address bar immediately after reading them into memory.

The owner-facing Studio Editor, approval page, and demonstration walkthrough remain English. Collector-facing forms and invitation emails use the chosen language.

## Security findings and changes

### Invitation races and revocation

An invitation could previously remain usable if concurrent approvals left a grant unreferenced by the current request. The access check now requires every grant, including grants with explicit collection permissions, to be the current invitation for that request. Approval completion uses a conditional write; a revocation or request change during email delivery cannot be overwritten by a late approval.

Tests cover superseded grants, revoked access, expiry, one-use approval links, legacy scopes, and revocation while email delivery is in progress. An invitation superseded during delivery is invalidated even if its email has already left the service. In that edge case, the studio must review the current request and issue a fresh invitation.

### Acquisition enquiry access

The enquiry endpoint previously accepted a known artwork without checking collector access. It did not return private prices, but allowed direct unauthenticated or out-of-scope enquiry submissions. It now requires a live collector session, permission for the artwork's collection, and a valid format.

### Embedded Studio access

Every framed Studio instance now requires explicit sign-in and omits browser cookies from its API calls. It uses its own short-lived, in-memory studio session. This prevents a framing page from relying on an existing top-level Studio login. Credentials remain out of local storage and parent messages. The local Collection Editor still works; a freshly opened embedded session must be signed in.

### Browser and privacy protections

- Added no-sniff, no-referrer, restricted camera/microphone/location permissions, and baseline content security directives against object embedding and base URL changes.
- Added same-origin framing protection to the real approval page.
- Excluded application-configured analytics from Studio, acquisition, and mailing-list pages.
- Added a no-referrer meta policy to the shared layout, including hosts that do not apply Netlify headers.
- Reject non-object JSON request bodies cleanly.

The baseline content security policy is not a strict script allowlist. The standalone file editor requires special embedding support; that workflow was preserved.

## Protections verified

- Anonymous Studio data and collection-price requests are denied server-side; sensitive API responses use private/no-store caching.
- Collector access is limited to approved collections and expires 24 hours after invitation issue.
- Owner Studio authorization verifies the GitHub account, not just possession of any GitHub token.
- Passwords, approval capabilities, and session values are stored as hashes on the server. Cookies are Secure, HttpOnly, and SameSite=Strict.
- Cross-origin state-changing requests are rejected. Submission limits use atomic updates and hashed IP identifiers.
- Collector responses contain current prices only, not future pricing brackets, client emails, or the mailing list.
- Edition sale recording and pricing writes use conditional updates to reject concurrent or stale changes. Already sold editions cannot be reopened by reducing the count.
- Untrusted collector text is escaped in HTML emails and displayed as text in Studio/approval interfaces.
- Mailing-list signup requires explicit consent and email confirmation; unsubscribe requires an emailed capability.
- Dependency audit: zero reported vulnerabilities in the current lockfile.
- 42 automated tests passed; Astro check: zero errors and zero warnings; 503 total pages built.

## Remaining boundaries

This review does not guarantee an unhackable site, and it is not a third-party penetration test or a review of historical access logs. It does not verify account-level MFA, provider account permissions, backup/restore procedures, email-provider retention, or DNS administration. Those settings were not available through the source review.

The editor deliberately remembers price summaries on the owner's device. They are an offline snapshot, not authenticated live data. Anyone with access to that browser profile/device may read them. Client email addresses and login tokens are not part of that snapshot.

There is no online payment checkout or automatic payment webhook yet. External sales must still be recorded in Studio. Atomic record updates prevent duplicate edition records in this workflow; they cannot prevent an unrecorded offline sale.

The photo right-click deterrent does not prevent downloading or screenshots. Only display-sized images should be public.

## Maintenance

Run `node --test tests/*.test.mjs`, `npm run build`, `python scripts/audit-built-site.py`, and `npm audit` after changes affecting translations or collector access. The new checks help catch missing language keys, dropped artwork context, access-control regressions, and footer/link issues.

References: [OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
