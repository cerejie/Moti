const successPattern = 30;

// A short tap on success. Only Android browsers implement vibrate; elsewhere it is absent.
export const vibrateSuccess = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(successPattern);
};
