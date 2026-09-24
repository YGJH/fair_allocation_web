-- A stable, immutable first example. The stored score is verified against the domain scorer in tests.
INSERT INTO cases (id, payload, baseline_seed)
VALUES ('00000000-0000-4000-8000-000000000101',
        '{"agents":["Maya","Leo"],"items":["Sketchbook","Lantern","Notebook"],"values":[[8,5,2],[2,6,7]]}'::jsonb,
        1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO allocations (id, case_id, owners, kind, nsw, score)
SELECT '00000000-0000-4000-8000-000000000102',
       '00000000-0000-4000-8000-000000000101',
       '[0,1,1]'::jsonb, 'baseline', 104,
       '{"utilities":["8","13"],"nsw":"104","ef1":true,"efx":true}'::jsonb
WHERE EXISTS (SELECT 1 FROM cases WHERE id='00000000-0000-4000-8000-000000000101')
ON CONFLICT (id) DO NOTHING;
