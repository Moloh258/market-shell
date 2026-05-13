import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { selectCartTotalQuantity } from "@/entities/cart/model/selectors";
import { CatalogPage } from "@/pages/catalog/ui/CatalogPage";
import { CartPage } from "@/pages/cart/ui/CartPage";
import { CheckoutPage } from "@/pages/checkout/ui/CheckoutPage";
import { OrdersPage } from "@/pages/orders/ui/OrdersPage";
import { AccountPage } from "@/pages/account/ui/AccountPage";
import { NotFoundPage } from "@/pages/not-found/ui/NotFoundPage";
import { AppShell } from "@/widgets/app-shell/ui/AppShell";
import { routePaths } from "./routePaths";

function MarketplaceRoutes() {
  const cartItemsCount = useAppSelector(selectCartTotalQuantity);

  return (
    <AppShell cartItemsCount={cartItemsCount}>
      <Routes>
        <Route path={routePaths.catalog} element={<CatalogPage />} />
        <Route path={routePaths.cart} element={<CartPage />} />
        <Route path={routePaths.checkout} element={<CheckoutPage />} />
        <Route path={routePaths.orders} element={<OrdersPage />} />
        <Route path={routePaths.account} element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <MarketplaceRoutes />
    </BrowserRouter>
  );
}
