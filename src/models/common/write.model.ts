// `id` keys the queue entry. An idempotent RPC takes its own `p_client_id` (newWriteId())
// in `args`, fixed when the write is created, so a replay after a lost response is ignored.
// `userId` is the signed-in user who made the write; only their session may send it.
export type IQueuedWrite =
  | {
      id: string;
      userId: string | null;
      label: string;
      // When it was queued; absent on writes queued before Phase 3.
      queuedAt?: string;
      kind: "insert";
      table: string;
      values: unknown;
    }
  | {
      id: string;
      userId: string | null;
      label: string;
      // When it was queued; absent on writes queued before Phase 3.
      queuedAt?: string;
      kind: "update";
      table: string;
      values: unknown;
      match: Record<string, unknown>;
    }
  | {
      id: string;
      userId: string | null;
      label: string;
      // When it was queued; absent on writes queued before Phase 3.
      queuedAt?: string;
      kind: "delete";
      table: string;
      match: Record<string, unknown>;
    }
  | {
      id: string;
      userId: string | null;
      label: string;
      // When it was queued; absent on writes queued before Phase 3.
      queuedAt?: string;
      kind: "rpc";
      fn: string;
      args: Record<string, unknown>;
    };

type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

export type IQueuedWriteInput = DistributiveOmit<IQueuedWrite, "id" | "userId" | "queuedAt">;

export interface IMutationResult {
  queued: boolean;
}
