// Route paths, referenced by the router, links, and guards.
export const ROUTES = {
  // Not a page: redirects to the landing page of the role.
  home: "/",
  signIn: "/sign-in",
  inventory: "/inventory",
  inventoryItem: "/inventory/:itemId",
  dashboard: "/dashboard",
  transaction: "/transaction",
  analyzer: "/analyzer",
  settings: "/settings",
  masterfile: "/settings/masterfile",
  users: "/settings/users",
  shops: "/settings/shops",
} as const;
