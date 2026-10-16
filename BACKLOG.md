# Backlog

## Planner

### Multi-user / adding users
- **Now:** sign-in only (`/api/auth/signin`). No sign-up, invite, or password-reset flow. Users can only be added via Supabase dashboard → Authentication → Users.
- **Check first:** `planner_logs` row-level security isn't in a migration, and `planner.astro` relies on it (its `user_id` filter is commented out). Confirm the policy exists in the live DB before adding a second user, or they may see other users' hours. `people`/`visits` are already owner-only.
- **Decide:** self sign-up vs invite-only; fully private planners vs any sharing.

### Year planning: "Date range" and "Recurring" modes
- Only "Select days" exists. Remaining modes per `design_handoff_visits_map_year_planning/` (`yearplan.jsx`, HANDOFF.md Part B).
- Date range default: today → 31 Dec (app uses Jan–Dec, not a Sept–Aug service year).

### Map page (deferred)
- Needs a map provider (MapLibre + MapTiler vs Mapbox) and a geocoding service chosen first.

### Housekeeping
- Commit `supabase/migrations` properly (CLI-generated, timestamped); only `visits_people.sql` exists and the planned-per-day unique index isn't tracked.
- Handoff QA: RLS isolation with two users, empty states, long addresses, mobile Safari.
- Remove prototype-only files once ported (`src/Prototype/` looks like an older copy of the handoff folder).

## Portfolio

- **Calibration System case study:** waiting on imagery approach (screenshots vs diagrams) and project details.
- **Retitle `src/content/work/calibration-management.md`:** it's the marketing site, not the system.
- **Refresh legacy case studies:** `charnwoodsa.md`, `atlanticletting.md`.
- **Polish:** `og:image` / canonical / Twitter meta in `MainHead.astro`, unused images in `public/assets/`, nav contact link.
- **Hero portrait:** replace the pre-composited image with a clean, higher-resolution photo (fixes slight edge softness).
