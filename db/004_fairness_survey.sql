-- Anonymous three-question fairness survey shown before the allocation lab.
-- A browser keeps one random session UUID; each question can be updated without creating duplicate votes.
CREATE TABLE IF NOT EXISTS survey_responses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL,
  allocation_id uuid NOT NULL REFERENCES allocations(id) ON DELETE RESTRICT,
  verdict boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, allocation_id)
);

CREATE INDEX IF NOT EXISTS survey_responses_by_allocation
  ON survey_responses(allocation_id, verdict);

CREATE INDEX IF NOT EXISTS survey_responses_by_session
  ON survey_responses(session_id);
