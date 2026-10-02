import type { IMutationResult } from "../../models/common/write.model";
import type { IInboxItem } from "../../models/data/inbox/inbox.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "notifications";
const columns = "id, title, body, url, tag, pending, created_at, read_at";
const inboxLimit = 50;
const channelName = "inbox-live";

const inboxServices = {
  // RLS returns only the signed-in user's rows.
  getList: async (signal?: AbortSignal): Promise<IInboxItem[]> => {
    let query = supabase.from(table).select(columns);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(inboxLimit);
    if (error) throw toError(error);

    return data ?? [];
  },

  markRead: (ids: readonly string[] | null): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "mark_notifications_read",
      label: ids ? "Mark notification read" : "Mark all notifications read",
      args: { p_ids: ids },
    }),

  subscribe: (onChange: () => void): (() => void) => {
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export default inboxServices;
