// Text roles used across every screen. Import these instead of repeating a size,
// weight and colour trio in JSX. Sizes come from the Moti scale in theme.css,
// which is not Tailwind's default scale.

export const pageTitle = "text-2xl font-semibold tracking-tight text-foreground";

export const pageSubtitle = "text-md text-muted-foreground";

export const sectionTitle = "text-lg font-semibold text-foreground";

export const cardTitle = "text-md font-semibold text-foreground";

export const fieldLabel = "text-sm font-medium text-foreground";

export const fieldHint = "text-xs text-text-subtle";

export const fieldError = "text-xs font-medium text-danger";

// Label/value pairs in detail panels and read-only rows.
export const detailLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

export const detailValue = "text-sm text-foreground";

// Figures that line up in a column.
export const numeric = "tabular-nums";

export const money = "tabular-nums font-medium text-foreground";

// Marks a required field beside its label.
export const requiredMark = "text-required";

export const link = "text-link underline-offset-2 hover:underline";
