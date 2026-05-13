import { configureStore } from "@reduxjs/toolkit";
import { cartReducer } from "@/entities/cart/model/cartSlice";
import { writeCartItemsToStorage } from "@/entities/cart/lib/cartStorage";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

let previousCartItems = store.getState().cart.items;

store.subscribe(() => {
  const nextCartItems = store.getState().cart.items;

  if (nextCartItems !== previousCartItems) {
    previousCartItems = nextCartItems;
    writeCartItemsToStorage(nextCartItems);
  }
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
