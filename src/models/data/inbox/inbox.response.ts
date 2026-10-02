export interface IInboxItem {
  id: string;
  title: string;
  body: string;
  url: string;
  tag: string | null;
  pending: boolean;
  created_at: string;
  read_at: string | null;
}

export type InboxKind = "stock" | "transaction" | "item" | "signup" | "reset" | "other";

const inboxKinds: readonly InboxKind[] = ["stock", "transaction", "item", "signup", "reset"];

// The database tags every row `<kind>-<record id>`.
export const inboxKindOf = (item: IInboxItem): InboxKind =>
  inboxKinds.find((kind) => item.tag?.startsWith(`${kind}-`)) ?? "other";

export const isInboxAttention = (item: IInboxItem): boolean => !item.read_at || item.pending;
