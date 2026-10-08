// The Masterfile page's tabs.
export const masterfileTabValues = ["categories", "brands"] as const;
export type MasterfileTab = (typeof masterfileTabValues)[number];
