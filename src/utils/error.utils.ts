export type IErrorKind = "network" | "failed";

export interface IErrorDescription {
  kind: IErrorKind;
  title: string;
  message: string;
}

const networkMessage = "Moti can't reach the server. Check your connection and try again.";

// The request never reached the server; the write can be queued and replayed.
export class NetworkError extends Error {
  constructor() {
    super(networkMessage);
    this.name = "NetworkError";
  }
}

const fetchFailurePattern = /failed to fetch|networkerror|load failed|network request failed/i;

// supabase-js reports a failed fetch as a plain object: no code, message "TypeError: …".
const isFetchFailureObject = (error: unknown): boolean => {
  if (!error || typeof error !== "object" || !("message" in error)) return false;
  const code = "code" in error ? String((error as { code: unknown }).code) : "";
  const message = String((error as { message: unknown }).message);
  return code === "" && (message.startsWith("TypeError:") || fetchFailurePattern.test(message));
};

// The shape of a failed request itself, whatever the device reports about its connection.
export const isFetchFailure = (error: unknown): boolean =>
  (error instanceof TypeError && fetchFailurePattern.test(error.message)) ||
  isFetchFailureObject(error);

export const isNetworkError = (error: unknown): boolean =>
  error instanceof NetworkError ||
  (typeof navigator !== "undefined" && !navigator.onLine) ||
  isFetchFailure(error);

export const describeError = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): IErrorDescription => {
  if (isNetworkError(error)) {
    return {
      kind: "network",
      title: "You're offline",
      message: networkMessage,
    };
  }

  return {
    kind: "failed",
    title: "Couldn't load this",
    message: error instanceof Error && error.message ? error.message : fallback,
  };
};
