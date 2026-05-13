import type { ReactNode } from "react";
import { Header } from "@/widgets/header/ui/Header";

type AppShellProps = {
  cartItemsCount: number;
  children: ReactNode;
};

export function AppShell({ cartItemsCount, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Header cartItemsCount={cartItemsCount} />
      <main className="app-main">{children}</main>
    </div>
  );
}
