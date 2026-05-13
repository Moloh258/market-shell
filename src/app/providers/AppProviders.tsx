import { Provider as ReduxProvider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/app/store";
import { QueryProvider } from "./QueryProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>{children}</QueryProvider>
    </ReduxProvider>
  );
}
