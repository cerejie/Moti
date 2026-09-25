// Route paths, referenced by the router, links, and guards.
export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  inventory: "/inventory",
  inventoryItem: "/inventory/:itemId",
  dashboard: "/dashboard",
  analyzer: "/analyzer",
  settings: "/settings",
  masterfile: "/settings/masterfile",
  users: "/settings/users",
  shops: "/settings/shops",
} as const;
