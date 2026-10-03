-- Two more survey-only allocations that separate fairness from NSW efficiency.
--
-- 501/502: the shown allocation is the unique NSW optimum (12 * 8 = 96)
-- and satisfies EF1, but Max still fails EFX when the lower-valued item is removed.
--
-- 601/602: both people receive utility 10 and the allocation satisfies EFX
-- (therefore EF1), but it is not NSW-optimal. Giving Camera to Teo and the
-- other two items to Sora produces NSW 20 * 10 = 200 instead of 100.
INSERT INTO cases (id, payload, baseline_seed)
VALUES
  ('00000000-0000-4000-8000-000000000501',
   '{"agents":["Lina","Max"],"items":["Concert ticket","Art book","Coffee voucher"],"values":[[4,8,1],[2,10,8]]}'::jsonb,
   1),
  ('00000000-0000-4000-8000-000000000601',
   '{"agents":["Sora","Teo"],"items":["Camera","Headphones","Board game"],"values":[[10,10,10],[10,5,5]]}'::jsonb,
   1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO allocations (id, case_id, owners, kind, nsw, score)
VALUES
  ('00000000-0000-4000-8000-000000000502',
   '00000000-0000-4000-8000-000000000501',
   '[0,0,1]'::jsonb, 'baseline', 96,
   '{"utilities":["12","8"],"nsw":"96","ef1":true,"efx":false,"efxFailure":{"i":1,"j":0,"item":0}}'::jsonb),
  ('00000000-0000-4000-8000-000000000602',
   '00000000-0000-4000-8000-000000000601',
   '[0,1,1]'::jsonb, 'baseline', 100,
   '{"utilities":["10","10"],"nsw":"100","ef1":true,"efx":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
