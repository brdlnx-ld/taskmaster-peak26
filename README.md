# Taskmaster PEAK 26 — Website for GitHub Pages

This folder contains the **participant-facing static site only** and the host presentation screen. The full site includes the approved V6 mini-games. The standalone unlimited-retry development lab and the outdated Supabase schema/function files are intentionally **NOT** included.

## Existing live backend

- Supabase project: `yydixabvablasptbkhhf` (second Supabase organisation, London region)
- Deployed function: `peak26-api` v1; URL: `https://yydixabvablasptbkhhf.supabase.co/functions/v1/peak26-api`
- Database: 17 protected tables, private `peak26-private` storage bucket.
- `live-config.js` contains only the **public** project URL and **public** `sb_publishable_...` key; it is safe for GitHub Pages.

## GitHub repository and Pages

The GitHub repository is **`brdlnx-ld/taskmaster-peak26`**, hosted at:
`https://github.com/brdlnx-ld/taskmaster-peak26`.

The root of this repository contains the complete static website. To publish it, open
**Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)` → Save**.
Expected site: `https://brdlnx-ld.github.io/taskmaster-peak26/`.

**Do not invite participants until backend secrets, host identity, CORS and real HTTP/browser tests are complete.**

## Required security setup before participant launch

- Create a Supabase Auth user for the host yourself, and whitelist its UUID in `public.peak_hosts`; do **not** share passwords in ChatGPT.
- Set private Edge Function secrets in Supabase: `PIN_PEPPER` (at least 24 random characters), `REGISTRATION_TOKEN` (at least 24 random characters), `ALLOWED_ORIGIN` (for this site `https://brdlnx-ld.github.io`). These are **server secrets** and must never appear in GitHub.
- Invite URL: `https://brdlnx-ld.github.io/taskmaster-peak26/#invite=YOUR_SERVER_TOKEN` — this is merely an unlisted join link, not robust identity verification.
- AI judge and Slack webhook are **not configured**. Do not promise automatic AI judging or Slack posting until enabled and tested (and any provider charge separately approved).
- Real HTTP and mobile integration tests remain **outstanding**; backend deployment status was confirmed by Supabase, database RPC tests passed, but runtime invocation couldn't be tested from this environment.
- The game evidence validation needs a more thorough cheating/fairness review before opening participant registration. Do not send invitations yet.
- Finale stays embargoed via published-score snapshots; confirm the Zoom host workflow end-to-end before launch.

No files in this package contain service-role keys, PIN peppers or registration tokens.
