import { describe, expect, it } from "vitest";
import type { AddCartItemPayload, CartItem } from "@/entities/cart/model/types";
import {
  addProductToCart,
  cartReducer,
  clearCart,
} from "@/entities/cart/model/cartSlice";
import { selectCartTotalQuantity } from "@/entities/cart/model/selectors";
import {
  addCartItem,
  changeCartItemQuantity,
  clearCartItems,
  getCartSubtotal,
  removeCartItem,
} from "./cart";
import {
  CART_STORAGE_KEY,
  parseCartItems,
  readCartItemsFromStorage,
  writeCartItemsToStorage,
} from "./cartStorage";

const productPayload: AddCartItemPayload = {
  productId: "p1",
  title: "Nike Air Max",
  price: 12990,
  imageUrl: "https://example.com/nike.png",
};

const cartItem: CartItem = {
  ...productPayload,
  quantity: 1,
};

function createMemoryStorage(initialValue?: string) {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(CART_STORAGE_KEY, initialValue);
  }

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}

describe("cart helpers", () => {
  it("adds a first item", () => {
    expect(addCartItem([], productPayload)).toEqual([cartItem]);
  });

  it("increments quantity when adding the same item", () => {
    expect(addCartItem([cartItem], productPayload)).toEqual([
      { ...cartItem, quantity: 2 },
    ]);
  });

  it("decreases quantity", () => {
    expect(
      changeCartItemQuantity([{ ...cartItem, quantity: 3 }], "p1", -1),
    ).toEqual([{ ...cartItem, quantity: 2 }]);
  });

  it("removes an item when quantity is decreased to zero", () => {
    expect(changeCartItemQuantity([cartItem], "p1", -1)).toEqual([]);
  });

  it("removes an item by product id", () => {
    expect(removeCartItem([cartItem], "p1")).toEqual([]);
  });

  it("clears cart items", () => {
    expect(clearCartItems()).toEqual([]);
  });

  it("calculates subtotal from item price and quantity", () => {
    const subtotal = getCartSubtotal([
      { ...cartItem, quantity: 2 },
      {
        productId: "p2",
        title: "Adidas Campus",
        price: 9990,
        quantity: 1,
      },
    ]);

    expect(subtotal).toBe(35970);
  });
});

describe("cart reducer", () => {
  it("adds a product to cart", () => {
    const state = cartReducer({ items: [] }, addProductToCart(productPayload));

    expect(state.items).toEqual([cartItem]);
  });

  it("clears cart", () => {
    const state = cartReducer({ items: [cartItem] }, clearCart());

    expect(state.items).toEqual([]);
  });
});

describe("cart selectors", () => {
  it("selects total quantity", () => {
    expect(
      selectCartTotalQuantity({
        cart: {
          items: [
            { ...cartItem, quantity: 2 },
            {
              productId: "p2",
              title: "Adidas Campus",
              price: 9990,
              quantity: 3,
            },
          ],
        },
      }),
    ).toBe(5);
  });
});

describe("cart storage", () => {
  it("falls back to an empty cart for corrupted localStorage data", () => {
    expect(parseCartItems("{broken json")).toEqual([]);
    expect(parseCartItems(JSON.stringify({ productId: "p1" }))).toEqual([]);
    expect(
      parseCartItems(JSON.stringify([{ ...cartItem, quantity: 0 }])),
    ).toEqual([]);
  });

  it("falls back to an empty cart when storage is unavailable", () => {
    expect(readCartItemsFromStorage(undefined)).toEqual([]);
  });

  it("reads valid cart items from storage", () => {
    const storage = createMemoryStorage(JSON.stringify([cartItem]));

    expect(readCartItemsFromStorage(storage)).toEqual([cartItem]);
  });

  it("writes cart items to storage", () => {
    const storage = createMemoryStorage();

    writeCartItemsToStorage([cartItem], storage);

    expect(storage.getItem(CART_STORAGE_KEY)).toBe(JSON.stringify([cartItem]));
  });

  it("removes storage value for an empty cart", () => {
    const storage = createMemoryStorage(JSON.stringify([cartItem]));

    writeCartItemsToStorage([], storage);

    expect(storage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});
