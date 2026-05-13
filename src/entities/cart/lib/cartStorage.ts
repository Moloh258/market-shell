import type { CartItem } from "../model/types";

export const CART_STORAGE_KEY = "marketplace-shell:cart:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getDefaultStorage(): StorageLike | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.productId === "string" &&
    typeof value.title === "string" &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    (value.imageUrl === undefined || typeof value.imageUrl === "string")
  );
}

export function parseCartItems(rawValue: string | null): CartItem[] {
  if (!rawValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.every(isValidCartItem) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function readCartItemsFromStorage(
  storage: StorageLike | undefined = getDefaultStorage(),
): CartItem[] {
  if (!storage) return [];

  try {
    return parseCartItems(storage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeCartItemsToStorage(
  cartItems: CartItem[],
  storage: StorageLike | undefined = getDefaultStorage(),
): void {
  if (!storage) return;

  try {
    if (cartItems.length === 0) {
      storage.removeItem(CART_STORAGE_KEY);
      return;
    }

    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // Storage can fail in private browsing, quota limits, or restricted hosts.
  }
}
