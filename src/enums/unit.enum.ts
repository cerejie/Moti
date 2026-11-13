// The database accepts only these (migration 12); the value is what lists show after a number.
export const itemUnitValues = ["pc", "set", "box", "pair", "liter", "meter"] as const;
export type ItemUnit = (typeof itemUnitValues)[number];

export const itemUnitLabels: Record<ItemUnit, string> = {
  pc: "Piece (pc)",
  set: "Set",
  box: "Box",
  pair: "Pair",
  liter: "Liter",
  meter: "Meter",
};
