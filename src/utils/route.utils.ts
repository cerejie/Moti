import { generatePath } from "react-router-dom";
import { ROUTES } from "../routes/route.paths";

export const itemPath = (itemId: string) => generatePath(ROUTES.item, { itemId });

export const transactionPath = (transactionId: string) =>
  generatePath(ROUTES.transactionDetail, { transactionId });

export const movementPath = (movementId: string) =>
  generatePath(ROUTES.movementDetail, { movementId });

export const userPath = (userId: string) => generatePath(ROUTES.userDetail, { userId });

// Mirrors NavLink's own matching: the root path matches exactly, every other
// path also matches its subpaths, so a subpage keeps its module highlighted.
export const isRouteActive = (path: string, pathname: string) =>
  path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));

// Moves the address bar without a navigation, so a router rebuilt for the new
// session (sign-in, sign-out) starts on this path instead of the old one.
export const resetLocation = (path: string) => {
  window.history.replaceState(null, "", path);
};
