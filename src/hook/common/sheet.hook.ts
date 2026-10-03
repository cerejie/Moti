import { useEffect, useId, useRef } from "react";
import type { createBrowserRouter } from "react-router-dom";
import { useSheetStore } from "../../store/common/sheet.store";

type AppRouter = ReturnType<typeof createBrowserRouter>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readDepth = (state: unknown) =>
  isRecord(state) && typeof state.sheetDepth === "number" ? state.sheetDepth : 0;

// An open sheet or dialog announces itself so the back gesture can close it.
export const useSheetEntry = (open: boolean, onClose: () => void) => {
  const id = useId();
  const register = useSheetStore((state) => state.register);
  const unregister = useSheetStore((state) => state.unregister);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    register(id, () => close.current());
    return () => unregister(id);
  }, [open, id, register, unregister]);
};

// Keeps one history entry per open sheet: back closes the top sheet instead of
// leaving the screen, and a sheet closed by its own controls takes its entry with it.
export const useSheetHistory = (router: AppRouter) => {
  useEffect(() => {
    let lastKey = router.state.location.key;
    let awaitingPop = false;
    let queued = false;
    let stopped = false;

    const reconcile = () => {
      const { location, historyAction, navigation } = router.state;
      const moved = location.key !== lastKey;
      lastKey = location.key;
      const depth = readDepth(location.state);
      const { sheets, unregister } = useSheetStore.getState();

      if (moved && historyAction === "POP") {
        if (awaitingPop) {
          awaitingPop = false;
        } else if (sheets.length > depth) {
          // The user went back: close what sat above the entry they landed on.
          sheets
            .slice(depth)
            .reverse()
            .forEach((sheet) => {
              unregister(sheet.id);
              sheet.close();
            });
          return;
        }
      }

      // A navigation in flight settles first, or the pop below would cancel it.
      if (awaitingPop || navigation.state !== "idle") return;

      if (sheets.length > depth) {
        void router.navigate(
          { pathname: location.pathname, search: location.search, hash: location.hash },
          {
            state: {
              ...(isRecord(location.state) ? location.state : {}),
              sheetDepth: depth + 1,
            },
          },
        );
      } else if (sheets.length < depth) {
        awaitingPop = true;
        void router.navigate(sheets.length - depth);
      }
    };

    // One pass per tick, so a sheet that closes as another opens keeps the entry.
    const schedule = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (!stopped) reconcile();
      });
    };

    const stopRouter = router.subscribe(schedule);
    const stopStore = useSheetStore.subscribe(schedule);
    schedule();

    return () => {
      stopped = true;
      stopRouter();
      stopStore();
    };
  }, [router]);
};
