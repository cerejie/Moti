import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { InventoryTab } from "../../../enums/inventory.enum";
import {
  dashboardAlertsKey,
  dashboardSummaryKey,
  movementListKey,
  scopedKey,
} from "../../../keys/query.keys";
import { stockAlertsModalKey } from "../../../keys/modal.keys";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { IStockAlert, IStockAlerts } from "../../../models/data/dashboard/dashboard.response";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { ROUTES } from "../../../routes/route.paths";
import dashboardServices from "../../../services/data/dashboard.services";
import movementServices from "../../../services/data/movement.services";
import { selectOnline, useNetworkStore } from "../../../store/common/network.store";
import type { Tone } from "../../../styles/common/tone.styles";
import { useFilters } from "../../common/filter.hook";
import { useModal } from "../../common/modal.hook";
import { settledSearchKey, useSearch } from "../../common/search.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { itemPath, useInventoryTab } from "../inventory/inventory.list.hook";
import { useActiveShop } from "../shop/shop.list.hook";

export const alertsPreviewSize = 8;
const recentMovementsSize = 5;

// Sales on other devices change stock too, and refetch-on-focus is off app-wide.
const useLiveRefresh = () => {
  const online = useNetworkStore(selectOnline);
  return online ? 60_000 : false;
};

// Rows are ordered by severity, so an out-of-stock item is always first.
const alertTone = (alerts?: IStockAlerts): Tone =>
  alerts?.data[0]?.stock_status === "out_of_stock" ? "danger" : "warning";

export const useStockSummary = () => {
  const { shopId } = useActiveShop();
  const refetchInterval = useLiveRefresh();

  const query = useQuery({
    queryKey: [scopedKey(dashboardSummaryKey, shopId)],
    queryFn: ({ signal }) => dashboardServices.getSummary(shopId ?? "", signal),
    enabled: Boolean(shopId),
    refetchInterval,
  });

  return { ...query, shopId };
};

// One query shared by the dashboard card, the topbar bell and the nav badge. Managers only.
export const useStockAlerts = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const { viewInsights } = usePermissions();
  const refetchInterval = useLiveRefresh();

  const query = useQuery({
    queryKey: [scopedKey(dashboardAlertsKey, shopId)],
    queryFn: ({ signal }) =>
      dashboardServices.getAlerts(shopId ?? "", alertsPreviewSize, signal),
    enabled: viewInsights && Boolean(shopId),
    refetchInterval,
  });

  return {
    ...query,
    canView: viewInsights,
    count: query.data?.totalCount ?? 0,
    tone: alertTone(query.data),
    openItem: (alert: IStockAlert) => navigate(itemPath(alert.id)),
  };
};

// Under the movement list prefix, so every stock write refreshes it.
export const useRecentMovements = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const pagination = { pageNumber: 1, pageSize: recentMovementsSize };

  const query = useQuery({
    queryKey: [scopedKey(movementListKey, shopId), "recent"],
    queryFn: ({ signal }) =>
      movementServices.getList(shopId ?? "", { tab: "all", search: "" }, pagination, signal),
    enabled: Boolean(shopId),
  });

  return {
    ...query,
    openItem: (movement: IStockMovement) => navigate(itemPath(movement.item_id)),
  };
};

// A status tile opens Inventory on that tab with the other filters cleared, so
// the list shows exactly the items the tile counted.
export const useOpenStockStatus = () => {
  const { setTab } = useInventoryTab();
  const { resetFilters } = useFilters(inventoryTableKey);
  const { resetSearch } = useSearch(inventoryTableKey);
  const { resetSearch: resetSettledSearch } = useSearch(settledSearchKey(inventoryTableKey));

  return (tab: InventoryTab) => {
    resetFilters();
    resetSearch();
    resetSettledSearch();
    setTab(tab);
  };
};

export const useStockAlertsModal = () => {
  const navigate = useNavigate();
  const { modal, openModal, closeModal } = useModal(stockAlertsModalKey);

  return {
    open: modal.visible,
    openModal: () => openModal(),
    closeModal,
    openItem: (alert: IStockAlert) => {
      closeModal();
      navigate(itemPath(alert.id));
    },
    openDashboard: () => {
      closeModal();
      navigate(ROUTES.dashboard);
    },
  };
};
