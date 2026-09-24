import { z } from 'zod';
export type CaseInput = { agents: string[]; items: string[]; values: number[][] };
export type Allocation = number[];
const names = z.array(z.string().trim().min(1).max(80)).nonempty();
const value = z.number().int().min(0).max(1_000_000);
function unique(xs: string[]) { return new Set(xs).size === xs.length; }
export function parseCase(input: unknown): CaseInput {
  const base = z.object({ agents: names, items: names, values: z.array(z.array(value)) }).parse(input);
  if (!unique(base.agents)) throw new Error('agent names must be unique');
  if (!unique(base.items)) throw new Error('item names must be unique');
  if (base.values.length !== base.agents.length) throw new Error('values row count must match agents');
  for (const row of base.values) if (row.length !== base.items.length) throw new Error('values must be rectangular');
  return base;
}
export function parseAllocation(c: CaseInput, input: unknown): Allocation {
  const owners = z.array(z.number().int()).parse(input);
  if (owners.length !== c.items.length) throw new Error('each item needs exactly one owner');
  for (const owner of owners) if (owner < 0 || owner >= c.agents.length) throw new Error('owner out of range');
  return owners;
}
