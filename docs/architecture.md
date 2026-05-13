# Архитектура проекта

`Marketplace Shell` - это клиентский marketplace shell на React, TypeScript и Vite. Проект развивается как portfolio MVP для customer-facing сценариев: каталог, корзина, личный кабинет, оформление заказа и заказы. Цель архитектуры - показать реалистичное разделение ответственности без лишнего усложнения.

## Текущая структура

```text
src/
  app/          bootstrap приложения, providers, routing, Redux store
  pages/        route-level страницы
  widgets/      крупные UI-блоки, которые собирают layout
  entities/     доменные модели, API-функции и бизнес-логика сущностей
  shared/       общая API-инфраструктура, mock data, query keys, ошибки
```

Папки `features` сейчас нет. Ее можно добавить позже, когда появятся отдельные пользовательские действия, которые не принадлежат одной сущности напрямую.

## Диаграмма

```text
React app
  |
  v
AppProviders
  |-- Redux Provider
  |     |
  |     v
  |   cart client/UI state
  |
  |-- TanStack Query Provider
        |
        v
      server/mock API state

AppRouter (BrowserRouter)
  |
  v
pages/*
  |
  |-- entities/*/model     TypeScript contracts
  |-- entities/*/lib       pure business logic
  |-- entities/*/api       API-like functions
  |
  v
shared/api
  |-- mockRequest()
  |-- mock-data
  |-- queryKeys
  |-- ApiError
```

## Ответственность слоев

`app` отвечает за сборку приложения: `AppProviders`, `AppRouter`, `routePaths`, Redux store и typed hooks.

`pages` содержит страницы маршрутов: `/`, `/cart`, `/checkout`, `/orders`, `/account` и not-found. Страницы связывают UI, queries, mutations и actions, но не должны импортировать `mock-data` напрямую.

`widgets` содержит крупные составные UI-блоки. Сейчас это `AppShell` и `Header`.

`entities` хранит доменную логику:

- `entities/cart` - cart types, Redux slice, selectors, pure cart logic, localStorage persistence.
- `entities/product` - product type и `getProducts()`.
- `entities/user` - user/address types, schemas и mock API functions.
- `entities/order` - order types, order API и localStorage-backed mock order storage.

`shared` хранит общую инфраструктуру: `mockRequest()`, `ApiError`, `queryKeys`, `mock-data`.

## Почему cart хранится в Redux Toolkit

Cart сейчас является client/UI state:

- корзина нужна на нескольких экранах: catalog, header, cart, checkout;
- нужны предсказуемые actions: add, increment, decrement, remove, clear;
- subtotal и total quantity удобно считать selectors;
- localStorage persistence подключена рядом со store, но не становится вторым source of truth.

Redux Toolkit выбран потому, что он уже подключен и дает понятную структуру для shared client state. Zustand намеренно не добавлялся, чтобы не смешивать два client-state подхода.

## Почему products, account и orders идут через TanStack Query

Products, account и orders считаются server/mock API state:

- данные приходят через API-like functions;
- queries дают loading, error и empty states;
- mutations invalidate нужные query keys;
- позже mock API можно заменить на real HTTP или MSW handlers без переписывания страниц.

Redux не используется для account/orders, потому что это не локальное UI-состояние, а данные, которыми в production должен владеть backend.

## Почему формы используют React Hook Form

React Hook Form держит form state локально внутри страницы/формы. Это хорошо подходит для profile, address и checkout forms:

- form state не нужен в Redux;
- меньше лишних re-render;
- удобно подключать `zodResolver`;
- submit logic остается рядом с mutation.

## Почему validation использует Zod

Zod используется для runtime validation:

- `updateUserProfileSchema` валидирует профиль;
- `addressSchema` валидирует адрес;
- `checkoutSchema` валидирует выбор адреса, payment method и comment.

TypeScript проверяет код во время разработки, но не защищает от данных пользователя или storage. Zod закрывает runtime слой перед mutation/API calls.

## Как используется localStorage

`localStorage` используется только в mock/demo целях:

- `marketplace-shell:cart:v1` хранит cart items;
- `marketplace-shell:orders:v1` хранит mock orders, чтобы созданные заказы переживали reload.

Доступ к storage находится не в pages, а в storage/API слоях. Код проверяет browser environment через `typeof window !== "undefined"` и оборачивает чтение/запись в `try/catch`.

## Почему frontend subtotal preview-only

Cart subtotal и `Order.subtotalPreview` считаются на frontend только для отображения. В реальном checkout backend должен пересчитать:

- prices;
- stock;
- product availability;
- discounts;
- shipping;
- taxes;
- final total;
- ownership выбранного address.

Frontend subtotal нельзя считать источником истины, потому что пользователь может изменить client-side state или localStorage.

## Что сейчас mock-only

Mock-only:

- catalog data;
- current user;
- addresses;
- orders;
- order persistence через `localStorage`;
- payment methods;
- checkout delivery/payment behavior.

Backend-owned later:

- authentication/session;
- user profile persistence;
- address ownership и validation;
- catalog source of truth;
- order creation и order history;
- final price calculation;
- stock reservation;
- payment provider integration;
- API error contracts.
