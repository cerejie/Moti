import type { IMutationResult } from "../models/common/write.model";
import { nameKey } from "./search.utils";

interface INamedRecord {
  id: string;
  name: string;
}

// A creatable field hands back a typed name: reuse the record it matches, or
// create one with a client id so a queued item save can already point at it.
export const resolveByName = async (
  records: readonly INamedRecord[],
  typed: string,
  create: (name: string, id: string) => Promise<IMutationResult>,
): Promise<string | null> => {
  const name = typed.trim().replace(/\s+/g, " ");
  if (name === "") return null;

  const existing = records.find((record) => nameKey(record.name) === nameKey(name));
  if (existing) return existing.id;

  const id = crypto.randomUUID();
  await create(name, id);
  return id;
};
