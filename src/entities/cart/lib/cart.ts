import type { AddCartItemPayload, CartItem } from "../model/types";

export function addCartItem(
  cartItems: CartItem[],
  product: AddCartItemPayload,
): CartItem[] {
  const existingItem = cartItems.some(
    (item) => item.productId === product.productId,
  );

  if (existingItem) {
    return cartItems.map((item) =>
      item.productId === product.productId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [
    ...cartItems,
    {
      productId: product.productId,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    },
  ];
}

export function changeCartItemQuantity(
  cartItems: CartItem[],
  productId: string,
  delta: number,
): CartItem[] {
  const targetItem = cartItems.find((item) => item.productId === productId);
  if (!targetItem) return cartItems;

  const nextQuantity = targetItem.quantity + delta;
  if (nextQuantity <= 0) {
    return cartItems.filter((item) => item.productId !== productId);
  }

  return cartItems.map((item) =>
    item.productId === productId ? { ...item, quantity: nextQuantity } : item,
  );
}

export function removeCartItem(
  cartItems: CartItem[],
  productId: string,
): CartItem[] {
  return cartItems.filter((item) => item.productId !== productId);
}

export function clearCartItems(): CartItem[] {
  return [];
}

export function getCartTotalQuantity(cartItems: CartItem[]): number {
  return cartItems.reduce<number>((acc, item) => acc + item.quantity, 0);
}

export function getCartSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce<number>((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
}
