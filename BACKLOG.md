# Backlog

## Planner

### Multi-user / adding users
- **Now:** sign-in only (`/api/auth/signin`). No sign-up, invite, or password-reset flow. Users can only be added via Supabase dashboard → Authentication → Users.
- **Privacy:** verified 2026-10-16. `planner_logs`, `people` and `visits` all have owner-only row-level security in the live DB, so a second user only sees their own data. (`planner_logs`' policies were created in the dashboard and aren't in a migration yet.)
- **Decide:** self sign-up vs invite-only; fully private planners vs any sharing.

### Year planning: "Date range" and "Recurring" modes
- Only "Select days" exists. Remaining modes per `design_handoff_visits_map_year_planning/` (`yearplan.jsx`, HANDOFF.md Part B).
- Date range default: today → 31 Dec (app uses Jan–Dec, not a Sept–Aug service year).

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
