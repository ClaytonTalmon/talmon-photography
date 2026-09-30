# Editions & Acquisitions

Collector page: `/en/editions/` (also available under each existing locale).
Private studio editor: `/editions-editor/`.

## Adjusting prices

1. Open the Editions Editor. Sign in using a GitHub personal access token belonging to **ClaytonTalmon**, with access to `ClaytonTalmon/talmon-photography`. The existing Collection Editor token can be used. It is sent over HTTPS to the site's function, verified against GitHub, and discarded; it is not saved in browser storage or the server store.
2. Select the photograph and **Standard Format** or **Large Format**.
3. Enter the currency, number of numbered prints sold, and the price for each pair (1–2, 3–4, etc.; the last bracket can contain one print).
4. Select **Save prices and availability**. This updates private server storage immediately, without a GitHub commit or a website rebuild. Reload an already-open collector page to see the updated price.

Prices start blank; the earlier prototype's illustrative prices are not published. A blank price is “Price on enquiry”. Unsaved sales counts are not presented as confirmed availability. Artist's proofs are excluded from numbered edition counts and remain on enquiry. Changes to edition counts and print dimensions still belong in the Collection Editor and require its normal publish/rebuild.

## Collector access

Collectors submit their name and email on the Editions page. The studio receives a request notification at `ctalmon@gmail.com`. Requests are also recorded in the editor.

**Approve & email password** sends a unique, randomly generated password to that collector. It expires **24 hours from issuance**, not 24 hours from first use. Collector cookies expire at the same deadline, and every private API request checks expiry and revocation. Reissuing removes the old grant. **Revoke access** invalidates the password and all existing sessions for that invitation.

The editor's own session lasts eight hours. Sign out when finished, especially on a shared computer. No shared collector password is embedded in HTML or JavaScript. The service stores password/session hashes, never the original values. The collector API returns only current prices, not future bracket schedules.

## Mailing list

Access requests do not add anyone to the mailing list unless they explicitly opt in. Standalone signup is available from the footer at `/[locale]/mailing-list/`, and on the Editions page. Subscribers receive a confirmation link valid for 48 hours. Only confirmed subscribers are exported. The signup page also offers self-service unsubscribe: it emails a 48-hour link and requires explicit confirmation before removing a subscription. Email links preserve the subscriber’s language. The editor lets you export CSV and remove people who email the studio asking to unsubscribe. It does not send campaigns; include an unsubscribe option when using the exported list with your mailing provider.

## Hosting

The public site currently deploys to **GitHub Pages** at `talmonphoto.com`. The secure collector service runs on **Netlify** at `https://willowy-pika-c392c9.netlify.app`. Public Collect and Mailing List links lead there. Requests submit directly; no mail application opens.

The Netlify function uses the existing `RESEND_API_KEY` environment variable and the sender `studio@updates.claytontalmon.com`. Ensure the key is available to Functions in the production context. Confirm the sender is verified in Resend; the existing public contact page currently uses Formspree, so Resend activation must be verified separately. No new shared password secret is required.

Private state is stored with `@netlify/blobs` in a site-wide store named `collector-editions`, using strong consistency and conditional writes for price edits. Preview contexts use separate stores and do not modify production prices or access. Local Astro preview serves the layouts only; use Netlify Dev or a Netlify deploy for the API. GitHub Pages alone cannot run these functions.

The generated `src/data/edition-catalog.mjs` contains public titles and dimensions, never prices. It is regenerated at build time from Collection Editor metadata and image orientation. All dimensions are width × height: paper = image +14 cm width / +17 cm height; estimated framing = paper +6 cm in both directions. Unknown dimensions or editions remain on enquiry.

After the initial production deployment, confirm that the API rejects unauthenticated catalog requests, sign into the editor, enter actual prices, and use a collector email you control to test delivery and unlock. The automated tests mock email delivery and never send real messages.

Builds require Node 22.12 or later (hosting uses Node 24). All deployed photo files are capped at 2,000 pixels on the longest edge. Right-click and image dragging are deterred only on photographs, without disabling text selection or forms. This is not download protection. Source assets and Git history are separate from the display files; a public repository can still expose source images.

Run `npm run test:editions` for access, expiry, revocation, pricing and consent tests; `npm run build` checks and builds all site pages.
