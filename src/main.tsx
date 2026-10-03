import "./styles/common/theme.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { selectUserId, useAccountStore } from "./store/data/account/account.store";
import { createPersistOptions, queryClient } from "./utils/query.utils";
import App from "./App.tsx";

const persistOptions = createPersistOptions(() => selectUserId(useAccountStore.getState()));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>,
);
