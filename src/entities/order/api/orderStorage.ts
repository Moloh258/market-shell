import { initialMockOrders } from "@/shared/api/mock-data";
import type { Order } from "../model/types";

export const ORDERS_STORAGE_KEY = "marketplace-shell:orders:v1";

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

function isValidCartItem(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    typeof value.productId === "string" &&
    typeof value.title === "string" &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    (value.imageUrl === undefined || typeof value.imageUrl === "string")
  );
}

function isValidAddress(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.fullName === "string" &&
    typeof value.phone === "string" &&
    typeof value.country === "string" &&
    typeof value.city === "string" &&
    typeof value.street === "string" &&
    typeof value.postalCode === "string" &&
    (value.isDefault === undefined || typeof value.isDefault === "boolean")
  );
}

function isValidOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.createdAt === "string" &&
    ["new", "paid", "shipped", "done"].includes(String(value.status)) &&
    typeof value.subtotalPreview === "number" &&
    Number.isFinite(value.subtotalPreview) &&
    typeof value.itemsCount === "number" &&
    Number.isInteger(value.itemsCount) &&
    value.itemsCount >= 0 &&
    Array.isArray(value.items) &&
    value.items.every(isValidCartItem) &&
    isValidAddress(value.shippingAddress) &&
    ["card_on_delivery", "cash_on_delivery"].includes(
      String(value.paymentMethod),
    ) &&
    (value.comment === undefined || typeof value.comment === "string")
  );
}

export function getInitialMockOrders(): Order[] {
  return initialMockOrders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
    shippingAddress: { ...order.shippingAddress },
  }));
}

export function parseStoredOrders(rawValue: string | null): Order[] | null {
  if (!rawValue) return null;

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue) || !parsedValue.every(isValidOrder)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export function readOrdersFromStorage(
  storage: StorageLike | undefined = getDefaultStorage(),
): Order[] {
  if (!storage) return getInitialMockOrders();

  try {
    return (
      parseStoredOrders(storage.getItem(ORDERS_STORAGE_KEY)) ??
      getInitialMockOrders()
    );
  } catch {
    return getInitialMockOrders();
  }
}

export function writeOrdersToStorage(
  orders: Order[],
  storage: StorageLike | undefined = getDefaultStorage(),
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}
