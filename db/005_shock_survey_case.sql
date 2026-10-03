-- Turn the first survey prompt into a deliberately counterintuitive EF1 example.
-- Nia's own utility is 60 + 40 = 100, while Omar's is 1. Omar values
-- Nia's bundle at 101, but removing the rare painting removes his envy:
-- the allocation is EF1, yet not EFX.
UPDATE cases
SET payload = '{"agents":["Nia","Omar"],"items":["Rare painting","Record collection","Bus ticket"],"values":[[60,40,0],[100,1,1]]}'::jsonb
WHERE id = '00000000-0000-4000-8000-000000000301';

UPDATE allocations
SET owners = '[0,0,1]'::jsonb,
    nsw = 100,
    score = '{"utilities":["100","1"],"nsw":"100","ef1":true,"efx":false,"efxFailure":{"i":1,"j":0,"item":1}}'::jsonb
WHERE id = '00000000-0000-4000-8000-000000000302';
