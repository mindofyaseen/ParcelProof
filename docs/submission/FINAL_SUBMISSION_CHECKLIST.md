# Final submission checklist

Official deadline: **October 2, 2026 at 11:59 PM PDT**, equivalent to **October 3, 2026 at 11:59 AM PKT**. Submit early enough to recover from Builder Center or upload issues.

## Verified and ready

- [x] Original application is live on AWS over public HTTPS with no sign-in.
- [x] Public API health endpoint returns `ok`.
- [x] One-click demo order exists.
- [x] Private presigned packing-photo upload works in production.
- [x] Real Amazon Bedrock multimodal inference runs in production.
- [x] Deterministic `PASS`, `BLOCK`, and safe `REVIEW` paths are implemented and tested.
- [x] Wrong parcel `BLOCK`, corrected `PASS`, and linked history are documented.
- [x] Unit/API/CDK tests, lint, typecheck, build, synth, and production browser smoke pass.
- [x] AWS MCP/coding-agent connection evidence is redacted and documented.
- [x] Security/privacy guardrails and honest limitations are documented.
- [x] README, Builder Center Markdown, form copy, and cover image are prepared.
- [x] Repository and live-demo URLs are public.

## Owner actions before Publish

- [ ] Record the 60–90 second demo using `DEMO_SCRIPT.md` and upload it to an accessible host.
- [ ] Add the demo-video link to `BUILDER_CENTER_SUBMISSION.md` and `README.md`.
- [ ] Open the live app in an incognito window and run one final wrong/corrected smoke flow.
- [ ] Paste the prepared title, description, body, tags, repository URL, and endpoint into Builder Center.
- [ ] Upload `parcelproof-builder-cover.jpg`.
- [ ] Preview the post; confirm headings, links, lists, and image render correctly.
- [ ] Select the offered tags matching `#commercial-potential` and singular `#startup`.
- [ ] Publish the Builder Center project.
- [ ] Add the published project URL to `README.md`.
- [ ] Complete the hackathon submission/entry step if Builder Center presents a separate final action.
- [ ] Save the published project URL and confirmation screenshot.

## Domain decision

Do not delay submission for a domain. The CloudFront hostname is the native public AWS endpoint and meets the ship gate. A professional custom hostname requires control of a registered domain or delegated subdomain, DNS validation, an ACM certificate, and a CloudFront alternate domain name. If an owned domain is available, map a subdomain such as `parcelproof.example.com` after the submission is safely published; otherwise retain the verified CloudFront URL.
