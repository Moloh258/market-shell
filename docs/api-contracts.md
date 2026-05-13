# API contracts

Документ описывает текущие TypeScript contracts из кода. Поля ниже не являются желаемой будущей схемой, а отражают то, что уже существует в проекте.

## Product

Источник: `src/entities/product/model/types.ts`

```ts
export type Product = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
};
```

`Product` представляет товар каталога. Используется на catalog page и приходит через `getProducts()`.

Статус: mock API сейчас, future backend contract позже.

Ограничения:

- нет description, category, brand, rating, stock quantity;
- `price` используется как display value;
- frontend не должен доверять `price` при checkout.

## CartItem

Источник: `src/entities/cart/model/types.ts`

```ts
export type CartItem = {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};
```

`CartItem` представляет snapshot товара в корзине. Используется в Redux cart state, cart page, checkout summary и order payload.

Статус: frontend-only client/UI state.

Ограничения:

- `price` является preview-only;
- `title` и `imageUrl` являются snapshot для UI;
- backend должен заново проверить product, price и availability.

## CartState

Источник: `src/entities/cart/model/types.ts`

```ts
export type CartState = {
  items: CartItem[];
};
```

`CartState` хранит список cart items в Redux Toolkit.

Статус: frontend-only client/UI state.

Ограничения:

- не содержит shipping, taxes, discounts;
- не является checkout contract;
- восстанавливается из `localStorage`, но storage не является source of truth.

## User

Источник: `src/entities/user/model/types.ts`

```ts
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};
```

`User` представляет текущего покупателя. Используется на `/account` через `getCurrentUser()` и `updateUserProfile()`.

Статус: mock API сейчас, future backend contract later.

Ограничения:

- нет auth/session model;
- нет roles/permissions;
- current user зафиксирован в mock data.

## Address

Источник: `src/entities/user/model/types.ts`

```ts
export type Address = {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
  isDefault?: boolean;
};
```

`Address` представляет адрес доставки. Используется в account forms, checkout address selection и `Order.shippingAddress`.

Статус: mock API сейчас, future backend contract later.

Ограничения:

- нет region/state, apartment, geo data;
- нет server-side ownership checks;
- `isDefault` поддержан только как простое mock-поле.

## Order

Источник: `src/entities/order/model/types.ts`

```ts
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
```

`Order` представляет заказ в mock order history. Используется на `/orders` и создается через `createOrder()`.

Статус: mock API сейчас, future backend contract later.

Ограничения:

- `subtotalPreview` не является final total;
- нет payment transaction;
- нет delivery price, taxes, discounts;
- `items` основаны на frontend cart snapshot;
- orders persist только в `localStorage` demo mode.

## Checkout payload

Источник: `src/entities/order/model/types.ts`

```ts
export type CreateOrderPayload = {
  items: CartItem[];
  shippingAddress: Address;
  subtotalPreview: number;
  paymentMethod: PaymentMethod;
  comment?: string;
};
```

`CreateOrderPayload` - payload для mock `createOrder()`. Он собирается на checkout page после выбора address и payment method.

Статус: mock API сейчас. В production этот contract должен быть пересмотрен вместе с backend.

Ограничения:

- payload передает `CartItem[]` с frontend price snapshot;
- backend later должен принимать минимальные identifiers и сам пересчитывать order;
- `shippingAddress` сейчас передается объектом, но production API обычно будет использовать `addressId` и проверять ownership.

Связанная form schema: `checkoutSchema` валидирует `addressId`, `paymentMethod` и optional `comment` до создания `CreateOrderPayload`.

## PaymentMethod

Источник: `src/entities/order/model/types.ts`

```ts
export type PaymentMethod = "card_on_delivery" | "cash_on_delivery";
```

`PaymentMethod` - стабильные internal keys для mock payment selection.

Статус: mock API/internal domain value.

Ограничения:

- real payment не реализован;
- labels должны отображаться отдельно в UI;
- значения нельзя переводить на русский, потому что это domain keys.

## OrderStatus

Источник: `src/entities/order/model/types.ts`

```ts
export type OrderStatus = "new" | "paid" | "shipped" | "done";
```

`OrderStatus` - стабильные internal keys для статуса заказа.

Статус: mock API/internal domain value.

Ограничения:

- state machine не реализована;
- transitions не валидируются backend;
- русские display labels должны быть отдельной mapping-таблицей, а не заменой values.
