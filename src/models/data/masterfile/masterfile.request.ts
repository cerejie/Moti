import { z } from "zod";
import type { MasterfileKind } from "../../../enums/masterfile.enum";

const entryName = (max: number, label: string) =>
  z.object({
    name: z.string().trim().min(1, `Enter the ${label} name`).max(max, `Keep the name under ${max} characters`),
  });

// The database caps unit names at 20 characters and location names at 80.
export const masterfileSchemas = {
  unit: entryName(20, "unit"),
  location: entryName(80, "location"),
} satisfies Record<MasterfileKind, z.ZodType>;

export type IMasterfileRequest = z.infer<typeof masterfileSchemas.unit>;
