// Route paths, referenced by the router, links, and guards.
export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  inventory: "/inventory",
  inventoryItem: "/inventory/:itemId",
  dashboard: "/dashboard",
  shops: "/shops",
} as const;
