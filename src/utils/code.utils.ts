// Category and brand codes: 2 to 6 capitals or digits, the parts of an item code.
export const codePattern = /^[A-Z0-9]{2,6}$/;

export const codeMessage = "Use 2 to 6 letters or digits, e.g. BRK";

// Typed input becomes a valid code as it is typed: capitals and digits only.
export const toCodeInput = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
