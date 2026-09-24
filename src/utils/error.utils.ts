export type IErrorKind = "network" | "failed";

export interface IErrorDescription {
  kind: IErrorKind;
  title: string;
  message: string;
}

// fetch rejects with a TypeError when the request never reaches the server;
// supabase-js returns the same failure as an error whose message is prefixed "TypeError: ".
export const isNetworkError = (error: unknown) =>
  (typeof navigator !== "undefined" && !navigator.onLine) ||
  (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) ||
  (error instanceof Error &&
    /^(TypeError|FetchError): .*(fetch|network|load failed)/i.test(error.message));

export const describeError = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): IErrorDescription => {
  if (isNetworkError(error)) {
    return {
      kind: "network",
      title: "You're offline",
      message: "Moti can't reach the server. Check your connection and try again.",
    };
  }

  return {
    kind: "failed",
    title: "Couldn't load this",
    message: error instanceof Error && error.message ? error.message : fallback,
  };
};
