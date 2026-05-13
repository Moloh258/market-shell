import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  addCartItem,
  changeCartItemQuantity,
  clearCartItems,
  removeCartItem,
} from "../lib/cart";
import { readCartItemsFromStorage } from "../lib/cartStorage";
import type { AddCartItemPayload, CartState } from "./types";

const initialState: CartState = {
  items: readCartItemsFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProductToCart(state, action: PayloadAction<AddCartItemPayload>) {
      state.items = addCartItem(state.items, action.payload);
    },
    increaseCartItemQuantity(state, action: PayloadAction<string>) {
      state.items = changeCartItemQuantity(state.items, action.payload, 1);
    },
    decreaseCartItemQuantity(state, action: PayloadAction<string>) {
      state.items = changeCartItemQuantity(state.items, action.payload, -1);
    },
    removeCartItemById(state, action: PayloadAction<string>) {
      state.items = removeCartItem(state.items, action.payload);
    },
    clearCart(state) {
      state.items = clearCartItems();
    },
  },
});

export const {
  addProductToCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  removeCartItemById,
  clearCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
