// TablePanel. The card that wraps a table with its toolbar and pagination,
// replacing the per-table wrapper markup each screen declared. The header
// comes from SectionCard; only the toolbar row and body are styled here.
export const tablePanelRoot = "overflow-hidden";

export const tablePanelToolbar = "border-b px-4 py-3";

// The row-cards would otherwise run into the card's edges; the gutter matches the
// toolbar and takes the table tray's canvas colour so the rows sit on one ground.
export const tablePanelBody = "min-w-0 bg-background px-4";

export const tablePanelState = "p-4";
