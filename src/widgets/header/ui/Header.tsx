import { NavLink } from "react-router-dom";
import { routePaths } from "@/app/router/routePaths";

type HeaderProps = {
  cartItemsCount: number;
};

export function Header({ cartItemsCount }: HeaderProps) {
  return (
    <header className="app-header">
      <NavLink className="brand-link" to={routePaths.catalog}>
        Marketplace Shell
      </NavLink>
      <nav className="main-nav" aria-label="Основная навигация">
        <NavLink to={routePaths.catalog}>Каталог</NavLink>
        <NavLink to={routePaths.cart}>Корзина ({cartItemsCount})</NavLink>
        <NavLink to={routePaths.orders}>Заказы</NavLink>
        <NavLink to={routePaths.account}>Аккаунт</NavLink>
      </nav>
    </header>
  );
}
