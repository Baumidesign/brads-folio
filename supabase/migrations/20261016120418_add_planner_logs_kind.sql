-- Distinguish ministry hours from credit hours on planner_logs.
-- Additive only: existing rows default to 'hours', nothing is dropped or rewritten.
ALTER TABLE public.planner_logs
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'hours'
  CONSTRAINT planner_logs_kind_check CHECK (kind IN ('hours', 'credit'));
