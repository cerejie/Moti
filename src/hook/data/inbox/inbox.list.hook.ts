import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { inboxListKey, stockAlertsKey } from "../../../keys/query.keys";
import { isInboxAttention, type IInboxItem } from "../../../models/data/inbox/inbox.response";
import inboxServices from "../../../services/data/inbox.services";
import { selectUserId, useAccountStore } from "../../../store/data/account/account.store";
import { useAppMutation } from "../../common/mutation.hook";

// A checkout can write several rows at once; one refresh covers them all.
const liveRefreshDelayMs = 500;

export const useInboxList = () => {
  const navigate = useNavigate();
  const userId = useAccountStore(selectUserId);

  const inboxQuery = useQuery({
    queryKey: [inboxListKey, userId],
    queryFn: ({ signal }) => inboxServices.getList(signal),
    enabled: userId !== null,
  });

  const markReadMutation = useAppMutation(
    (ids: readonly string[] | null) => inboxServices.markRead(ids),
    {
      invalidate: [[inboxListKey]],
      queuedMessage: "Marked read — will sync when you're back online.",
    },
  );

  const items = inboxQuery.data ?? [];

  return {
    pendingItems: items.filter((item) => item.pending),
    updateItems: items.filter((item) => !item.pending),
    unreadCount: items.filter((item) => !item.read_at).length,
    attentionCount: items.filter(isInboxAttention).length,
    loading: inboxQuery.isLoading,
    error: inboxQuery.error,
    retry: () => void inboxQuery.refetch(),
    markingAllRead: markReadMutation.isPending,
    markAllRead: () => markReadMutation.mutate(null),
    openItem: (item: IInboxItem) => {
      if (!item.read_at) markReadMutation.mutate([item.id]);
      navigate(item.url);
    },
  };
};

// Mounted once by the shell: a new row refreshes the bell and the stock alerts live.
export const useInboxRealtime = () => {
  const queryClient = useQueryClient();
  const userId = useAccountStore(selectUserId);

  useEffect(() => {
    if (!userId) return;

    let pending: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(pending);
      pending = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: [inboxListKey] });
        void queryClient.invalidateQueries({ queryKey: [stockAlertsKey] });
      }, liveRefreshDelayMs);
    };

    const unsubscribe = inboxServices.subscribe(refresh);

    return () => {
      clearTimeout(pending);
      unsubscribe();
    };
  }, [queryClient, userId]);
};
