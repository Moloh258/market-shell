import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOrder, getOrders } from "./orderApi";
import {
  getInitialMockOrders,
  ORDERS_STORAGE_KEY,
  parseStoredOrders,
  readOrdersFromStorage,
  writeOrdersToStorage,
} from "./orderStorage";
import { setMockOrders } from "@/shared/api/mock-data";
import type { CartItem } from "@/entities/cart/model/types";
import type { Address } from "@/entities/user/model/types";

const item: CartItem = {
  productId: "p1",
  title: "Nike Air Max",
  price: 12990,
  quantity: 2,
};

const address: Address = {
  id: "addr-1",
  fullName: "Danil Marketplace",
  phone: "+7 999 123-45-67",
  country: "Russia",
  city: "Moscow",
  street: "Tverskaya Street 1",
  postalCode: "125009",
  isDefault: true,
};

function createMemoryStorage(initialValue?: string) {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(ORDERS_STORAGE_KEY, initialValue);
  }

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    clear: vi.fn(() => {
      values.clear();
    }),
  };
}

function createFailingStorage() {
  return {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => {
      throw new Error("Storage is full");
    }),
    removeItem: vi.fn(),
  };
}

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: createMemoryStorage(),
  });
  setMockOrders([]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("order API", () => {
  it("creates an order from checkout payload", async () => {
    const order = await createOrder({
      items: [item],
      shippingAddress: address,
      subtotalPreview: 25980,
      paymentMethod: "card_on_delivery",
      comment: "Call before delivery",
    });

    expect(order).toMatchObject({
      status: "new",
      subtotalPreview: 25980,
      itemsCount: 2,
      items: [item],
      shippingAddress: address,
      paymentMethod: "card_on_delivery",
      comment: "Call before delivery",
    });
    expect(Number.isNaN(Date.parse(order.createdAt))).toBe(false);
    expect("total" in order).toBe(false);
  });

  it("persists created order to mock order storage", async () => {
    const order = await createOrder({
      items: [item],
      shippingAddress: address,
      subtotalPreview: 25980,
      paymentMethod: "cash_on_delivery",
    });
    const storedOrders = parseStoredOrders(
      window.localStorage.getItem(ORDERS_STORAGE_KEY),
    );

    expect(storedOrders?.[0]).toEqual(order);
  });

  it("reads persisted orders", async () => {
    const order = await createOrder({
      items: [item],
      shippingAddress: address,
      subtotalPreview: 25980,
      paymentMethod: "cash_on_delivery",
    });

    await expect(getOrders()).resolves.toEqual([
      order,
      ...getInitialMockOrders(),
    ]);
  });

  it("falls back to initial mock orders for corrupted storage", () => {
    const storage = createMemoryStorage("{broken json");

    expect(readOrdersFromStorage(storage)).toEqual(getInitialMockOrders());
  });

  it("falls back to initial mock orders for empty storage", () => {
    const storage = createMemoryStorage();

    expect(readOrdersFromStorage(storage)).toEqual(getInitialMockOrders());
  });

  it("returns false when order storage write fails", () => {
    expect(writeOrdersToStorage(getInitialMockOrders(), createFailingStorage())).toBe(
      false,
    );
  });

  it("rejects order creation when mock persistence fails", async () => {
    vi.stubGlobal("window", {
      localStorage: createFailingStorage(),
    });

    await expect(
      createOrder({
        items: [item],
        shippingAddress: address,
        subtotalPreview: 25980,
        paymentMethod: "card_on_delivery",
      }),
    ).rejects.toThrow("Не удалось сохранить тестовый заказ");
  });

  it("does not persist a new order when mock persistence fails", async () => {
    const failingStorage = createFailingStorage();
    vi.stubGlobal("window", {
      localStorage: failingStorage,
    });

    await expect(
      createOrder({
        items: [item],
        shippingAddress: address,
        subtotalPreview: 25980,
        paymentMethod: "card_on_delivery",
      }),
    ).rejects.toThrow("Не удалось сохранить тестовый заказ");

    expect(failingStorage.setItem).toHaveBeenCalledTimes(1);
    expect(readOrdersFromStorage(failingStorage)).toEqual(getInitialMockOrders());
  });

  it("rejects order creation from an empty cart", async () => {
    await expect(
      createOrder({
        items: [],
        shippingAddress: address,
        subtotalPreview: 0,
        paymentMethod: "card_on_delivery",
      }),
    ).rejects.toThrow("Нельзя создать заказ из пустой корзины");
  });
});
