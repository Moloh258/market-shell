# Marketplace Shell

`Marketplace Shell` — React + TypeScript + Vite приложение для клиентских marketplace-сценариев: каталог, корзина, оформление заказа, заказы и личный кабинет.

Проект сейчас работает как standalone MVP. Он концептуально подготовлен к будущей microfrontend integration, но embedded mode пока не реализован.

## Документация

- [Архитектура](docs/architecture.md)
- [API contracts](docs/api-contracts.md)
- [Microfrontend integration](docs/microfrontend-integration.md)
- [AGENTS.md для Codex/AI agents](docs/AGENTS.md)
- [AI maintenance guide](docs/ai-maintenance-guide.md)
- [Architecture decisions](docs/decisions/)
- [Manual testing checklist](docs/manual-testing.md)

## Текущий объем MVP

Реализовано:

- маршрут каталога: `/`
- маршрут корзины: `/cart`
- маршрут оформления заказа: `/checkout`
- маршрут заказов: `/orders`
- маршрут личного кабинета: `/account`
- маршрут not-found
- простой `AppShell` и `Header`
- cart на Redux Toolkit с безопасной persistence в `localStorage`
- API-like functions поверх mock data
- TanStack Query для catalog, orders, account и checkout data
- формы профиля и адресов через React Hook Form + Zod
- checkout MVP, который связывает cart, сохраненные addresses и mock order creation
- mock orders persistence в `localStorage` для локального demo mode
- Vitest coverage для cart logic, schemas и mock API behavior

Запланировано, но пока не реализовано:

- избранное
- сравнение товаров
- AI shopping assistant
- реальная авторизация
- реальная оплата

## Скрипты

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run check
npm run build
npm run preview
```

`npm run check` запускает `typecheck`, `lint` и `test`.

Перед тем как принимать изменения, стоит запускать:

```bash
npm run check
npm run build
```

## Запуск

Установить зависимости:

```bash
npm install
```

Запустить локальный dev server:

```bash
npm run dev
```

Собрать production build:

```bash
npm run build
```

## Архитектура

Проект использует облегчённую layer-based структуру:

- `app`: bootstrap приложения, providers, routing, Redux store
- `pages`: route-level screens
- `widgets`: составные layout/UI блоки
- `features`: место для будущих пользовательских сценариев
- `entities`: domain models, entity APIs и business logic
- `shared`: переиспользуемая API infrastructure, types и utilities

Server state хранится в TanStack Query. Client/UI state хранится в Redux Toolkit только там, где состояние общее для нескольких экранов и ему нужны предсказуемые transitions. Небольшие UI-состояния остаются внутри компонентов или форм.

## Состояние корзины

`cart` - это client/UI state, им владеет Redux Toolkit:

- `entities/cart/model/cartSlice.ts` содержит cart mutations.
- `entities/cart/model/selectors.ts` отдает derived cart data.
- `entities/cart/lib/cart.ts` содержит pure cart business logic.
- `entities/cart/lib/cartStorage.ts` безопасно читает и пишет cart items в `localStorage`.

Данные из `localStorage` валидируются перед использованием. Если storage поврежден или содержит неожиданный формат, приложение откатывается к пустой корзине и не падает.

Subtotal корзины - только frontend UI preview. Реальный checkout должен пересчитывать prices, stock, discounts, shipping и taxes на backend.

## Область личного кабинета

Страница `/account` - mock-backed основа для профиля покупателя и адресов доставки:

- `getCurrentUser()` и `getUserAddresses()` читают mock account data.
- `updateUserProfile()`, `addAddress()`, `updateAddress()` и `removeAddress()` меняют mock API state.
- React Hook Form держит form state локально.
- Zod schemas валидируют profile и address payloads перед mutation calls.

Реальная авторизация пока не подключена. Current user - фиксированные mock data. Backend integration позже должна добавить auth/session handling, persistent profile storage, address ownership checks, server-side validation и нормальные error contracts.

## Область оформления заказа

`checkout` - mock MVP, который связывает существующий cart state с сохраненными addresses:

- `/checkout` доступен только если cart не пустой.
- Страница показывает сводку корзины, выбор адреса, заглушку доставки, заглушку оплаты и optional comment field.
- `createOrder()` создает mock order, после успешной mutation страница заказов перезапрашивает data.
- Cart очищается только после успешного mock order creation.
- Mock orders сохраняются в `localStorage` с ключом `marketplace-shell:orders:v1`, чтобы demo orders переживали page reload.
- Если mock order persistence fails, order creation fails и cart не очищается.

Реальная оплата не реализована. Frontend subtotal - только UI preview. Production backend должен владеть order persistence и final total calculation, включая price, stock, product availability, address ownership, delivery costs, taxes и discounts.

## API-граница

Страницы не должны импортировать mock data напрямую. Они должны работать через API-like functions:

- `getProducts()`
- `getOrders()`
- `getCurrentUser()`
- `getUserAddresses()`
- `createOrder()`

Сейчас эти функции используют mock data. Позже внутренности можно заменить на real HTTP calls или MSW handlers без переписывания pages.

## Направление микрофронтенда

Сейчас приложение использует `BrowserRouter` для standalone development. Для embedded mode route tree нужно экспортировать отдельно и рендерить под router host-приложения, либо адаптировать к memory/history router, которым управляет host. Текущий split через `MarketplaceRoutes` в `AppRouter` - первый шаг к этому.

## Заметки по безопасности

- Client cart totals и checkout subtotal - только UI previews, backend не должен им доверять.
- Account и checkout payloads нужно валидировать runtime schemas перед отправкой.
- Production backend должен проверять prices, stock, ownership, address, shipping, taxes и final total.
- Secrets и AI provider keys нельзя хранить во frontend code.
