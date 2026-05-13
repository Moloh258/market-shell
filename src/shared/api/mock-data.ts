import type { Product } from "../../entities/product/model/types";
import type { Order } from "../../entities/order/model/types";
import type { Address, User } from "../../entities/user/model/types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    title: "Nike Air Max",
    price: 12990,
    imageUrl: "https://via.placeholder.com/240x160",
    inStock: true,
  },
  {
    id: "p2",
    title: "Adidas Campus",
    price: 9990,
    imageUrl: "https://via.placeholder.com/240x160",
    inStock: true,
  },
  {
    id: "p3",
    title: "Puma RS-X",
    price: 8990,
    imageUrl: "https://via.placeholder.com/240x160",
    inStock: false,
  },
];

const mockDefaultAddress: Address = {
  id: "addr-1",
  fullName: "Danil Marketplace",
  phone: "+7 999 123-45-67",
  country: "Россия",
  city: "Москва",
  street: "Тверская улица, 1",
  postalCode: "125009",
  isDefault: true,
};

export const initialMockOrders: Order[] = [
  {
    id: "ord-101",
    createdAt: "2026-04-11T10:00:00.000Z",
    status: "paid",
    subtotalPreview: 22980,
    itemsCount: 2,
    items: [
      {
        productId: "p1",
        title: "Nike Air Max",
        price: 12990,
        imageUrl: "https://via.placeholder.com/240x160",
        quantity: 1,
      },
      {
        productId: "p2",
        title: "Adidas Campus",
        price: 9990,
        imageUrl: "https://via.placeholder.com/240x160",
        quantity: 1,
      },
    ],
    shippingAddress: mockDefaultAddress,
    paymentMethod: "card_on_delivery",
  },
  {
    id: "ord-102",
    createdAt: "2026-04-10T14:30:00.000Z",
    status: "shipped",
    subtotalPreview: 8990,
    itemsCount: 1,
    items: [
      {
        productId: "p3",
        title: "Puma RS-X",
        price: 8990,
        imageUrl: "https://via.placeholder.com/240x160",
        quantity: 1,
      },
    ],
    shippingAddress: mockDefaultAddress,
    paymentMethod: "cash_on_delivery",
  },
];

export let mockOrders: Order[] = initialMockOrders;

export let mockCurrentUser: User = {
  id: "user-1",
  name: "Danil Marketplace",
  email: "danil@example.com",
  phone: "+7 999 123-45-67",
};

export let mockAddresses: Address[] = [mockDefaultAddress];

export function setMockCurrentUser(user: User): void {
  mockCurrentUser = user;
}

export function setMockAddresses(addresses: Address[]): void {
  mockAddresses = addresses;
}

export function setMockOrders(orders: Order[]): void {
  mockOrders = orders;
}
