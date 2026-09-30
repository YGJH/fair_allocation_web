-- Three additional immutable practice cases: identical values, non-identical values, and a challenge.
INSERT INTO cases (id, payload, baseline_seed)
VALUES
  ('00000000-0000-4000-8000-000000000201',
   '{"agents":["Ari","Bo"],"items":["Tea set","Houseplant","Speaker"],"values":[[7,4,2],[7,4,2]]}'::jsonb,
   1),
  ('00000000-0000-4000-8000-000000000301',
   '{"agents":["Nia","Omar"],"items":["Camera","Map","Blanket"],"values":[[9,3,2],[2,8,6]]}'::jsonb,
   1),
  ('00000000-0000-4000-8000-000000000401',
   '{"agents":["Iris","Kai"],"items":["Telescope","Keyboard","Tent","Cook set"],"values":[[12,9,2,1],[11,10,8,1]]}'::jsonb,
   1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO allocations (id, case_id, owners, kind, nsw, score)
VALUES
  ('00000000-0000-4000-8000-000000000202',
   '00000000-0000-4000-8000-000000000201',
   '[0,1,1]'::jsonb, 'baseline', 42,
   '{"utilities":["7","6"],"nsw":"42","ef1":true,"efx":true}'::jsonb),
  ('00000000-0000-4000-8000-000000000302',
   '00000000-0000-4000-8000-000000000301',
   '[0,1,1]'::jsonb, 'baseline', 126,
   '{"utilities":["9","14"],"nsw":"126","ef1":true,"efx":true}'::jsonb),
  ('00000000-0000-4000-8000-000000000402',
   '00000000-0000-4000-8000-000000000401',
   '[0,1,1,0]'::jsonb, 'baseline', 234,
   '{"utilities":["13","18"],"nsw":"234","ef1":true,"efx":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
