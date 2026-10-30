# Backlog

## Planner

### Multi-user / adding users — invite-only, in progress
- **Built (2026-10-17):** `/auth/confirm` set-password page for invite + reset links, forgot-password page, sign-in/sign-out on per-request clients. Invites are sent from the Supabase dashboard.
- **Done in Supabase:** custom SMTP, redirect URLs.
- **To finish:** confirm Site URL is `https://bradbaumi.com.au` (not `/planner`), Invite + Reset Password email templates, end-to-end test with a second email. (Public sign-up turned off 2026-10-30, verified.) Optional: DKIM + DMARC for `bradbaumi.com.au`.
- **Later (optional):** in-app invite page for the admin (needs the service role key as a server-only env var).
- **Privacy:** verified 2026-10-16. `planner_logs`, `people` and `visits` all have owner-only row-level security in the live DB, so a second user only sees their own data. (`planner_logs`' policies were created in the dashboard and aren't in a migration yet.)
- **Decided:** invite-only; each planner fully private.

### Year planning: "Date range" and "Recurring" modes
- Only "Select days" exists. Remaining modes per `design_handoff_visits_map_year_planning/` (`yearplan.jsx`, HANDOFF.md Part B).
- Date range default: today → 31 Dec (app uses Jan–Dec, not a Sept–Aug service year).

### Speed (done 2026-10-30)
- Calendar (`32a1ad4`) and Visits (`b3e5994`) are static pages that load their data in the browser, skipping the Netlify function (stuck in us-east-1 on the free plan; Supabase is in Tokyo).

### Map page (deferred)
- Needs a map provider (MapLibre + MapTiler vs Mapbox) and a geocoding service chosen first.

### Housekeeping
- Migrations: the repo is now linked to the Supabase "Planner" project and new changes use CLI migrations. Still to do: rename `visits_people.sql` to the timestamped format (the CLI skips it), and capture the dashboard-created `planner_logs` table and policies in a baseline migration. The planned-per-day unique index from the handoff was never created.
- Handoff QA: RLS isolation with two users, empty states, long addresses, mobile Safari.
- Remove prototype-only files once ported (`src/Prototype/` looks like an older copy of the handoff folder).

## Portfolio

- **Calibration System case study:** waiting on imagery approach (screenshots vs diagrams) and project details.
- **Retitle `src/content/work/calibration-management.md`:** it's the marketing site, not the system.
- **Refresh legacy case studies:** `charnwoodsa.md`, `atlanticletting.md`.
- **Polish:** `og:image` / canonical / Twitter meta in `MainHead.astro`, unused images in `public/assets/`, nav contact link.
- **Hero portrait:** replace the pre-composited image with a clean, higher-resolution photo (fixes slight edge softness).
