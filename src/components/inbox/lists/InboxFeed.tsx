import {
  Bell,
  BellOff,
  CheckCheck,
  KeyRound,
  PackagePlus,
  Receipt,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useInboxList } from "../../../hook/data/inbox/inbox.list.hook";
import {
  inboxKindOf,
  type IInboxItem,
  type InboxKind,
} from "../../../models/data/inbox/inbox.response";
import {
  inboxList,
  inboxRow,
  inboxRowBody,
  inboxRowIcon,
  inboxRowMeta,
  inboxRowText,
  inboxRowTitle,
  inboxSection,
  inboxSectionHeader,
  inboxSectionTitle,
  inboxUnreadDot,
} from "../../../styles/inbox/inbox.styles";
import { formatDateTime } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import ErrorState from "../../common/status/ErrorState";
import EmptyState from "../../common/status/EmptyState";

const inboxIcons: Record<InboxKind, LucideIcon> = {
  stock: TriangleAlert,
  transaction: Receipt,
  item: PackagePlus,
  signup: UserPlus,
  reset: KeyRound,
  other: Bell,
};

type IProps = {
  // "action" lists requests still waiting on the user; it hides itself when empty.
  section: "action" | "updates";
  onOpen?: () => void;
};

const InboxFeed = ({ section, onOpen }: IProps) => {
  const inbox = useInboxList();
  const isAction = section === "action";
  const items = isAction ? inbox.pendingItems : inbox.updateItems;

  if (isAction && items.length === 0) return null;

  const open = (item: IInboxItem) => {
    onOpen?.();
    inbox.openItem(item);
  };

  const renderBody = () => {
    if (!isAction && inbox.loading) return <EmptyState loading description="Loading notifications…" />;
    if (!isAction && inbox.error) return <ErrorState error={inbox.error} onRetry={inbox.retry} />;
    if (items.length === 0) {
      return (
        <EmptyState
          icon={<BellOff />}
          title="No updates yet"
          description="New notifications show up here."
        />
      );
    }

    return (
      <ul className={inboxList}>
        {items.map((item) => {
          const KindIcon = inboxIcons[inboxKindOf(item)];
          const unread = !item.read_at;
          return (
            <li key={item.id}>
              <AppButton variant="ghost" className={inboxRow} onPress={() => open(item)}>
                <span className={inboxRowIcon({ pending: item.pending })}>
                  <KindIcon aria-hidden="true" />
                </span>
                <span className={inboxRowText}>
                  <span className={inboxRowTitle({ unread })}>{item.title}</span>
                  {item.body && <span className={inboxRowBody}>{item.body}</span>}
                  <span className={inboxRowMeta}>{formatDateTime(item.created_at)}</span>
                </span>
                {unread && <span className={inboxUnreadDot} aria-label="Unread" />}
              </AppButton>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section className={inboxSection}>
      <div className={inboxSectionHeader}>
        <h3 className={inboxSectionTitle}>{isAction ? "Needs your action" : "Updates"}</h3>
        {!isAction && inbox.unreadCount > 0 && (
          <AppButton
            variant="ghost"
            size="sm"
            loading={inbox.markingAllRead}
            onPress={inbox.markAllRead}
          >
            <CheckCheck />
            Mark all read
          </AppButton>
        )}
      </div>
      {renderBody()}
    </section>
  );
};

export default InboxFeed;
