import type { CartItem } from "@/entities/cart/model/types";
import type { Address } from "@/entities/user/model/types";

export type OrderStatus = "new" | "paid" | "shipped" | "done";

export type PaymentMethod = "card_on_delivery" | "cash_on_delivery";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  subtotalPreview: number;
  itemsCount: number;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  comment?: string;
};

export type CreateOrderPayload = {
  items: CartItem[];
  shippingAddress: Address;
  subtotalPreview: number;
  paymentMethod: PaymentMethod;
  comment?: string;
};
