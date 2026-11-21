# Backlog

## Planner

### Multi-user / adding users — invite-only, in progress
- **Built (2026-10-17):** `/auth/confirm` set-password page for invite + reset links, forgot-password page, sign-in/sign-out on per-request clients. Invites are sent from the Supabase dashboard.
- **Done in Supabase:** custom SMTP, redirect URLs.
- **To finish:** confirm Site URL is `https://bradbaumi.com.au` (not `/planner`), Invite + Reset Password email templates, end-to-end test with a second email. (Public sign-up turned off 2026-10-30, verified.) Optional: DKIM + DMARC for `bradbaumi.com.au`.
- **Next to build:** "Change password" in the Account tab (bottom nav), for signed-in users. Lets someone added via Supabase "Create new user" with a temporary password pick their own, without needing email.
- **Invite email failing (2026-10-31):** "Error sending invite email" when inviting a second address; no user was created. Check Supabase Auth logs and the custom SMTP settings (sender, host, port, password).
- **Later (optional):** in-app invite page for the admin (needs the service role key as a server-only env var).
- **Privacy:** verified 2026-10-16. `planner_logs`, `people` and `visits` all have owner-only row-level security in the live DB, so a second user only sees their own data. (`planner_logs`' policies were created in the dashboard and aren't in a migration yet.)
- **Decided:** invite-only; each planner fully private.

### Bug: bottom calendar entry hidden behind bottom nav on iPhone (2026-10-31)
- The last (earliest) entry card sits behind the bottom nav and + button even when scrolled to the end.
- Tried `1c98663`: body `padding-bottom` 96px → `calc(176px + env(safe-area-inset-bottom))` on Calendar and Visits. Verified live CSS has it, but the user says no change after refresh and re-login.
- Next: reproduce at phone size with real data. Check whether the body is actually the scroll container (iOS can ignore body bottom padding in some layouts), try a spacer element or `padding-bottom` on `.container` / `#logListContainer`, and check whether the user opens it from a home-screen icon (cached).

### Year planning: "Date range" and "Recurring" modes
- Only "Select days" exists. Remaining modes per `design_handoff_visits_map_year_planning/` (`yearplan.jsx`, HANDOFF.md Part B).
- Date range default: today → 31 Dec (app uses Jan–Dec, not a Sept–Aug service year).

### Speed (done 2026-10-30)
- Calendar (`32a1ad4`) and Visits (`b3e5994`) are static pages that load their data in the browser, skipping the Netlify function (stuck in us-east-1 on the free plan; Supabase is in Tokyo).

### Map page — live 2026-10-30 (`d502e99`)
- MapLibre + MapTiler (free plan, key `PUBLIC_MAPTILER_KEY` in Netlify). Addresses geocoded in the browser on save; "Find them" button backfills contacts without a location.
- "Add here" and "Move pin" added 2026-10-30 (`04e1673`).
- To do: 7 of 10 contacts are on the map; the other 3 need a suburb added in Visits. Optional: remove `*.netlify.app` from the MapTiler key's allowed origins (previews stop showing the map).
- **House numbers (idea, 2026-10-31):** the map style shows OpenStreetMap house numbers at zoom 18+, but OSM has almost none in the southern suburbs (checked: zero on a residential street there; ~9 in Norwood). Options: (1) satellite view toggle via MapTiler's free satellite/hybrid style — recommended; (2) small house-number label under each pin from the saved address; (3) both.

### Home tab ("Today") — maybe, undecided (2026-11-21)
- New first tab: compact goal summary (reuses `src/lib/ministryMath.ts`), 📌 pinned people, and the 5 people longest since a visit (skip "Not now"). Tap a person → their sheet.
- Needs a `people.pinned` migration, a Pin toggle in PersonSheet, and a 5-tab bottom nav. Open question: should Home or Calendar be the screen the app opens on?
- Mock-up made 2026-11-21 (screen 3 of the planner preview).

### Invite friends from inside the app — planned 2026-11-21
- **Blocked by:** the failing invite email (see Multi-user above): check Supabase Auth logs + custom SMTP, confirm Site URL and Invite/Reset templates.
- **Build (~1 session once email works):** (1) Supabase service role key as a server-only Netlify env var (run `netlify env:list` first; NOT `PUBLIC_`); (2) `/api/admin/invite` route that checks the caller may invite, then `auth.admin.inviteUserByEmail(email, { redirectTo: '/auth/confirm' })`; (3) "Invite a friend" field in the Account panel with sent/error states; (4) test with a second email: set password, starts empty, can't see your data.
- **Decide:** who can invite (only Brad — recommended — or anyone); email invite (recommended, reuses `/auth/confirm`) vs temporary password (needs "Change password" built first).
- **Meanwhile:** add people by hand in the Supabase dashboard (Authentication → Users → Add user → Create new user, Auto Confirm on) and share the password in person.

### Hide the + button while scrolling (idea, 2026-11-21)
- Hide on scroll down; bring back on scroll up, when scrolling stops, or at the bottom of the page. Calendar and Visits only (Map's "Add here" stays). Respect reduced motion.
- Context: bottom nav slimmed 102px → 66px (`d87a372`); hiding the nav itself was rejected.

### Housekeeping
- Migrations: the repo is now linked to the Supabase "Planner" project and new changes use CLI migrations. Still to do: rename `visits_people.sql` to the timestamped format (the CLI skips it), and capture the dashboard-created `planner_logs` table and policies in a baseline migration. The planned-per-day unique index from the handoff was never created.
- Handoff QA: RLS isolation with two users, empty states, long addresses, mobile Safari.
- Remove prototype-only files once ported (`src/Prototype/` looks like an older copy of the handoff folder).

## Portfolio

### Done (2026-11-21)
- Hero gauge record (`b06cb21`), og:image + social meta + canonical (`8f09926`), B favicon, caption-style work cards, case study images (`411cc95`), legacy entries rewritten and reordered (`c6ce571`), Supabase wording replaced with PostgreSQL (`c775c39`).

### Highest impact (needs input from Brad)
- **Case study outcomes:** add 1–2 concrete results to the Calibration System case study (e.g. worksheet time before vs after, transcription errors, audit prep). Optional: a 10–15s muted screen recording of filling in a worksheet.
- **Testimonial:** one quote from the current manager or a past client (Atlantic is the easiest ask). Can be unnamed, e.g. "Owner, Cape Town holiday letting business". Don't name Atlantic's owner without permission.
- **Clear next step on services:** who it's for, what a first chat looks like, a booking link (e.g. Cal.com), optionally "projects typically start from…".

### Quick wins (can do without input)
- **Keep the planner out of search:** check `/planner`, `/auth`, visits and map pages are `noindex` and disallowed in `robots.txt`. Longer term, consider moving the planner to a subdomain.
- **Per-page descriptions:** the fallback is still "The personal site of Bradley Baumann". Give every page its own title and description using search terms (e.g. "calibration software Australia"). Add `@astrojs/sitemap`.
- **Thumbnail years:** Charnwood's thumbnail says 2016 (should be 2015) and calibrationmanagement.com.au's says 2018 (should be 2017). Remake them and convert the legacy `.jpg` thumbnails to WebP.

### Later
- **Articles:** 1–2 short posts in the niche, e.g. "Moving calibration records off spreadsheets" or "What auditors look for in calibration records".
- **Flagship card:** restyle the Calibration System thumbnail to match the bold coloured cards, and/or make it full-width.
- **App screenshots:** retake the dashboard with practice data (no real customer names) and the equipment record with a real-looking Make and Model. Crop out the sidebar (employer name and email).
- **Analytics:** privacy-friendly analytics (Netlify Analytics or Plausible).
- **Gauge record:** optional descending (↓) readings column.
- **Open questions:** is "Since launch I've hosted…" still true for calibrationmanagement.com.au? Did Charnwood also use a custom theme?
- **Cleanup:** unused assets (`public/assets/case-study.jpg`, untracked `case-study-torque.webp`). Keep `portrait-hero.png`, which is the avatar source. Delete the merged local `hero-gauge` branch.
