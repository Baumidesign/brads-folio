-- ============================================================
-- visits_people.sql
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor).
-- Creates: people, visits, indexes, RLS policies, trigger,
--          people_with_last_visit view, and explicit GRANTs.
-- ============================================================


-- ── 1. PEOPLE TABLE ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.people (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT '',
  address     text        NOT NULL DEFAULT '',
  area        text        NOT NULL DEFAULT '',
  lat         numeric(10, 7),
  lng         numeric(10, 7),
  interest    smallint    NOT NULL DEFAULT 3 CHECK (interest BETWEEN 1 AND 5),
  follow_up   text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);


-- ── 2. VISITS TABLE ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.visits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid        NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  visit_date  date        NOT NULL DEFAULT CURRENT_DATE,
  notes       text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ── 3. INDEXES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS people_user_idx   ON public.people (user_id);
CREATE INDEX IF NOT EXISTS visits_person_idx ON public.visits (person_id);
CREATE INDEX IF NOT EXISTS visits_user_idx   ON public.visits (user_id);


-- ── 4. ROW-LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- people policies (owner-scoped, mirrors planner_logs pattern)
CREATE POLICY "people: owner select"
  ON public.people FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "people: owner insert"
  ON public.people FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "people: owner update"
  ON public.people FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "people: owner delete"
  ON public.people FOR DELETE
  USING (auth.uid() = user_id);

-- visits policies
CREATE POLICY "visits: owner select"
  ON public.visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "visits: owner insert"
  ON public.visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visits: owner update"
  ON public.visits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visits: owner delete"
  ON public.visits FOR DELETE
  USING (auth.uid() = user_id);


-- ── 5. UPDATED_AT TRIGGER ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER people_touch_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ── 6. CONVENIENCE VIEW ──────────────────────────────────────

CREATE OR REPLACE VIEW public.people_with_last_visit AS
SELECT
  p.*,
  MAX(v.visit_date)  AS last_visit_date,
  COUNT(v.id)::int   AS visit_count
FROM public.people p
LEFT JOIN public.visits v ON v.person_id = p.id
GROUP BY p.id;


-- ── 7. EXPLICIT GRANTS (required — tables created after cutoff) ──

GRANT SELECT, INSERT, UPDATE, DELETE ON public.people  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits  TO authenticated;
GRANT SELECT                          ON public.people_with_last_visit TO authenticated;
