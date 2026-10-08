-- Keep built-in exercises language-neutral: the UI localizes numeric item labels.
-- These IDs are reserved curated content, so updating their display-only labels is safe.
UPDATE cases
SET payload = jsonb_set(
  jsonb_set(payload, '{agents}', '["Alice","Bob"]'::jsonb),
  '{items}',
  CASE id
    WHEN '00000000-0000-4000-8000-000000000401'::uuid THEN '["1","2","3","4"]'::jsonb
    ELSE '["1","2","3"]'::jsonb
  END
)
WHERE id IN (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000601'
);
