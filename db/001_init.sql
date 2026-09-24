CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS cases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payload jsonb NOT NULL, baseline_seed integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), fractional_status text, fractional_value text, fractional_started_at timestamptz);
CREATE TABLE IF NOT EXISTS allocations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id) ON DELETE RESTRICT, owners jsonb NOT NULL, kind text NOT NULL CHECK (kind IN ('visitor','baseline')), nsw numeric NOT NULL, score jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS allocations_rank ON allocations(case_id, nsw DESC, created_at ASC);
CREATE TABLE IF NOT EXISTS ratings (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, allocation_id uuid NOT NULL REFERENCES allocations(id) ON DELETE RESTRICT, value smallint NOT NULL CHECK (value BETWEEN 1 AND 5), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS ratings_by_allocation ON ratings(allocation_id);
CREATE TABLE IF NOT EXISTS write_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL);
