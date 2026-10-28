// Route paths, referenced by the router, links, guards and push notifications.
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  transaction: "/transaction",
  transactionDetail: "/transaction/:transactionId",
  inventory: "/inventory",
  masterfile: "/inventory/masterfile",
  item: "/inventory/:itemId",
  movements: "/movements",
  users: "/users",
  account: "/account",
} as const;
