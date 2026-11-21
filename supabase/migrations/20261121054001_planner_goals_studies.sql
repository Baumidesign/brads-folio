-- Monthly hour goal and Bible studies for the Calendar goal card.
-- Additive only: two new tables, nothing existing is changed.

-- Usual monthly goal, one row per user.
CREATE TABLE IF NOT EXISTS public.planner_settings (
  user_id      uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  monthly_goal numeric NOT NULL DEFAULT 50 CHECK (monthly_goal >= 0 AND monthly_goal <= 300),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Per-month values: an optional goal override and the studies count.
-- `month` is always the first day of the month (e.g. 2026-11-01).
CREATE TABLE IF NOT EXISTS public.planner_months (
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  month      date NOT NULL CHECK (extract(day FROM month) = 1),
  goal       numeric CHECK (goal IS NULL OR (goal >= 0 AND goal <= 300)),
  studies    integer NOT NULL DEFAULT 0 CHECK (studies >= 0 AND studies <= 999),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month)
);

ALTER TABLE public.planner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_months   ENABLE ROW LEVEL SECURITY;

-- Owner-only, matching planner_logs / people / visits.
CREATE POLICY "planner_settings owner select" ON public.planner_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "planner_settings owner insert" ON public.planner_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "planner_settings owner update" ON public.planner_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "planner_settings owner delete" ON public.planner_settings FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "planner_months owner select" ON public.planner_months FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "planner_months owner insert" ON public.planner_months FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "planner_months owner update" ON public.planner_months FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "planner_months owner delete" ON public.planner_months FOR DELETE TO authenticated USING (user_id = auth.uid());
