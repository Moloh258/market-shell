export type CartItem = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

export type AddCartItemPayload = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
};

export type CartState = {
  items: CartItem[];
};
