import { ApiError } from "@/shared/api/errors";
import { mockRequest } from "@/shared/api/client";
import { setMockOrders } from "@/shared/api/mock-data";
import type { CreateOrderPayload, Order } from "../model/types";
import { readOrdersFromStorage, writeOrdersToStorage } from "./orderStorage";

function createOrderId(): string {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getItemsCount(items: CreateOrderPayload["items"]): number {
  return items.reduce<number>((count, item) => count + item.quantity, 0);
}

function syncMockOrders(orders: Order[]): Order[] {
  setMockOrders(orders);
  return orders;
}

export function getOrders(): Promise<Order[]> {
  return mockRequest(syncMockOrders(readOrdersFromStorage()));
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (payload.items.length === 0) {
    throw new ApiError("Нельзя создать заказ из пустой корзины", 400);
  }

  const order: Order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    status: "new",
    subtotalPreview: payload.subtotalPreview,
    itemsCount: getItemsCount(payload.items),
    items: payload.items.map((item) => ({ ...item })),
    shippingAddress: { ...payload.shippingAddress },
    paymentMethod: payload.paymentMethod,
    comment: payload.comment,
  };

  const nextOrders = [order, ...readOrdersFromStorage()];
  const isPersisted = writeOrdersToStorage(nextOrders);

  if (!isPersisted) {
    throw new ApiError("Не удалось сохранить тестовый заказ", 500);
  }

  syncMockOrders(nextOrders);

  return mockRequest(order);
}
