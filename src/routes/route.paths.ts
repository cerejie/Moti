// Route paths, referenced by the router, links, and guards.
export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  inventory: "/inventory",
  inventoryItem: "/inventory/:itemId",
  movements: "/movements",
  dashboard: "/dashboard",
  analyzer: "/analyzer",
  shops: "/shops",
  users: "/users",
  settings: "/settings",
} as const;
