export type MasterfileTab = "categories" | "brands" | "units" | "locations";

export const masterfileTabLabels: Record<MasterfileTab, string> = {
  categories: "Categories",
  brands: "Brands",
  units: "Units",
  locations: "Locations",
};

// Units and storage locations are plain named lists, so they share one service,
// hook and form, picked by kind.
export type MasterfileKind = "unit" | "location";

export const masterfileKindLabels: Record<MasterfileKind, { one: string; many: string }> = {
  unit: { one: "unit", many: "units" },
  location: { one: "location", many: "locations" },
};
