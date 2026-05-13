import type { RootState } from "@/app/store";
import { getCartSubtotal, getCartTotalQuantity } from "../lib/cart";

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartTotalQuantity = (state: RootState) =>
  getCartTotalQuantity(selectCartItems(state));

export const selectCartSubtotal = (state: RootState) =>
  getCartSubtotal(selectCartItems(state));
