# Microfrontend Integration

## 1. Purpose

Этот документ описывает, как `Marketplace Shell` может быть подготовлен к microfrontend integration.

Документ нужен нескольким ролям:

- frontend developer этого проекта;
- host app developer;
- backend developer, отвечающий за API contract;
- technical reviewer.

Он описывает текущее состояние и целевую модель embedded mode. Это не production deployment guide. Сейчас embedded mode не реализован, а проект работает как standalone React application.

## 2. Current Status

Сейчас проект работает в standalone mode:

- build tool - Vite;
- entry point - `src/main.tsx`;
- `src/main.tsx` вызывает `createRoot(document.getElementById("root")!)`;
- root component - `src/app/App.tsx`;
- routing - `BrowserRouter` в `src/app/router/AppRouter.tsx`;
- state - Redux Toolkit для cart;
- server/mock state - TanStack Query;
- API - mock functions, которые используют `src/shared/api/mock-data.ts`;
- persistence - сохранение cart и mock orders в `localStorage`.

Embedded mode не реализован.

Что уже помогает будущей интеграции:

- есть route constants в `src/app/router/routePaths.ts`;
- pages не импортируют `mock-data` напрямую;
- cart state отделен от server/mock API state;
- `localStorage` keys имеют namespace;
- mock API спрятан за entity API functions.

Что не готово:

- нет public `mount`/`unmount` API;
- нет отдельного entry point для embedded mode;
- `MarketplaceRoutes` не экспортирован как public module;
- `BrowserRouter` считает, что приложение владеет browser location;
- нет runtime config для API base URL;
- нет auth/user context contract;
- нет setup для Module Federation, Web Component, single-spa или iframe;
- нет error boundary для зоны microfrontend;
- глобальный CSS может влиять на host app.

## 3. Target Integration Model

В коде пока не выбрана финальная microfrontend technology.

Целевая модель - runtime integration: host app загружает bundle проекта и монтирует его в переданный DOM container.

Предпочтительное направление по текущему коду:

- добавить public entry point, например `src/entry/mountMarketplace.tsx`;
- экспортировать `mountMarketplace()`;
- внутри `mountMarketplace()` создавать React root в переданном `container`;
- возвращать `unmount()`;
- оставить standalone entry point `src/main.tsx` для локальной разработки.

Module Federation, Web Component, single-spa и iframe сейчас не настроены. Их можно рассматривать позже, но в текущем репозитории нет config-файла, который подтверждает выбранный подход.

## 4. Public Integration Contract

Public API для `mount` сейчас не реализован.

Ожидаемый будущий public contract может выглядеть так:

```ts
export type MarketplaceMountOptions = {
  container: HTMLElement;
  initialRoute?: string;
  user?: {
    id: string;
    name?: string;
  };
  authToken?: string;
  onNavigate?: (path: string) => void;
  onError?: (error: unknown) => void;
};

export type MarketplaceInstance = {
  unmount: () => void;
};

export function mountMarketplace(
  options: MarketplaceMountOptions,
): MarketplaceInstance;
```

Поля этого contract:

- `container` - DOM node, в который host app монтирует microfrontend.
- `initialRoute` - стартовый внутренний route, если microfrontend routing нужен внутри выделенного namespace.
- `user` - user context от host app. Сейчас не используется, потому что auth не реализован.
- `authToken` - token от host app для будущих API-запросов. Сейчас API работает в mock-only режиме.
- `onNavigate` - callback для синхронизации navigation с host app, если host app управляет top-level routing.
- `onError` - callback для передачи ошибок в host app.
- `unmount` - cleanup method, который host app должен вызвать при удалении зоны с microfrontend.

Host app не должен импортировать `src/app/App.tsx`, `src/app/store.ts`, pages или internal API clients напрямую. Это создаст жесткую связанность и нарушит границу microfrontend.

## 5. Host Application Responsibilities

Host app должен предоставить:

- DOM `container`;
- route namespace или другой routing contract;
- runtime config, если API станет real HTTP;
- auth/user context, если появится auth;
- fallback UI для зоны с microfrontend;
- вызов `unmount()` при удалении зоны;
- shared dependency strategy, если будет Module Federation.

Host app должен работать только с public integration contract.

Host app не должен:

- импортировать internal files из `src/`;
- читать Redux store этого проекта;
- вызывать entity API functions напрямую;
- полагаться на internal routing implementation;
- менять `localStorage` keys напрямую без согласованного adapter contract.

## 6. Runtime Configuration

Runtime config сейчас не реализован.

В коде не найдено:

- `import.meta.env`;
- `VITE_*` variables;
- API base URL;
- remote entry URL;
- public path config;
- feature flags;
- runtime config object.

Сейчас данные берутся из mock API:

- `getProducts()`;
- `getCurrentUser()`;
- `getUserAddresses()`;
- `getOrders()`;
- `createOrder()`.

Для embedded mode нужно принять решения:

- как задается API base URL;
- как host app передает auth headers или token;
- где хранится runtime config;
- какие feature flags нужны;
- чем отличаются dev/prod настройки.

## 7. Routing Contract

Сейчас routing реализован через `BrowserRouter`:

```ts
export function AppRouter() {
  return (
    <BrowserRouter>
      <MarketplaceRoutes />
    </BrowserRouter>
  );
}
```

Routes:

- `/`;
- `/cart`;
- `/checkout`;
- `/orders`;
- `/account`;
- `*` для not-found.

В standalone mode это нормально.

В embedded mode microfrontend не должен считать, что он владеет всем browser location. Его routes должны быть ограничены выделенным namespace или синхронизироваться с host app через явный routing contract.

Requires decision:

- использовать namespace вроде `/marketplace/*`;
- использовать `MemoryRouter` внутри microfrontend;
- передавать navigation через `onNavigate`;
- позволить host app владеть top-level route;
- экспортировать route tree без `BrowserRouter`.

Not implemented yet:

- route namespace;
- router adapter;
- host navigation callbacks;
- public export `MarketplaceRoutes`.

## 8. Communication Contract

Callbacks/events между host app и microfrontend сейчас не реализованы.

Минимальный будущий communication contract может быть callback-based:

```ts
export type MarketplaceEvent =
  | {
      type: "marketplace:navigate";
      payload: { path: string };
    }
  | {
      type: "marketplace:checkout-created";
      payload: { orderId: string };
    }
  | {
      type: "marketplace:error";
      payload: { error: unknown };
    };
```

Возможные направления:

- host app -> microfrontend: `initialRoute`, `user`, `authToken`, runtime config;
- microfrontend -> host app: navigation request, order created, error reported.

Не нужно добавлять события заранее без use case. Для текущего MVP достаточно зафиксировать, что communication contract отсутствует и должен быть определен перед embedded mode.

## 9. Auth and User Context

Auth сейчас не реализован.

Текущее состояние:

- текущий пользователь берется из `mockCurrentUser`;
- auth token не хранится;
- `localStorage` не используется для auth;
- `sessionStorage` не используется;
- cookies не читаются;
- API clients не добавляют auth headers;
- user context не передается через props/context от host app.

Для embedded mode лучше получать auth/user context от host app через public integration contract, а не читать его напрямую из global storage.

Requires decision:

- shape `user`;
- token format;
- header name, например `Authorization`;
- token refresh ownership;
- поведение при expired session;
- что делает microfrontend при logout в host app.

## 10. API Contract

API contract пока не формализован.

Сейчас API layer работает в mock-only режиме:

- `src/entities/product/api/productApi.ts`;
- `src/entities/user/api/userApi.ts`;
- `src/entities/order/api/orderApi.ts`;
- `src/shared/api/client.ts`.

`mockRequest()` только имитирует latency и возвращает клонированные данные.

Перед production embedded mode нужно зафиксировать:

- API base URL;
- auth headers;
- request/response shape;
- error format;
- ownership данных;
- retry policy;
- cache invalidation rules;
- backend validation rules.

Data ownership:

- backend должен владеть catalog source of truth;
- backend должен владеть user profile и addresses;
- backend должен владеть orders;
- backend должен пересчитывать final prices, stock, shipping, taxes и total;
- frontend `subtotalPreview` не является authoritative value.

## 11. State and Storage

Текущее state ownership:

- Redux Toolkit - cart client/UI state;
- TanStack Query - products, account и orders server/mock API state;
- React Hook Form - form state;
- local component state - небольшое UI-состояние.

Storage:

- cart сохраняется в `marketplace-shell:cart:v1`;
- mock orders сохраняются в `marketplace-shell:orders:v1`;
- `sessionStorage` не используется.

Storage access находится в:

- `src/entities/cart/lib/cartStorage.ts`;
- `src/entities/order/api/orderStorage.ts`.

Для browser-only logic уже есть guard:

```ts
if (typeof window !== "undefined") {
  // browser-only storage logic
}
```

Риски для embedded mode:

- host app может иметь свою persistence strategy;
- несколько экземпляров microfrontend могут конфликтовать из-за storage;
- storage может быть запрещен browser policy;
- host app может ожидать centralized cart ownership.

Для standalone MVP прямое использование `localStorage` допустимо. Для embedded mode лучше вынести storage в adapter, чтобы host app мог контролировать persistence strategy.

## 12. Shared Dependencies

Runtime dependencies из `package.json`:

- `react`;
- `react-dom`;
- `react-router-dom`;
- `@reduxjs/toolkit`;
- `react-redux`;
- `@tanstack/react-query`;
- `react-hook-form`;
- `zod`.

UI library или design system сейчас не используются.

Module Federation не настроен. Если он будет выбран позже, `react` и `react-dom` обычно должны быть shared singletons. Также нужно согласовать версии `react-router-dom`, если routing contract зависит от shared router.

Shared dependency strategy отсутствует и остается задачей на будущее.

## 13. Styling and DOM Isolation

Стили сейчас глобальные:

- основной файл - `src/index.css`;
- импортируется в `src/main.tsx`;
- используются selectors `:root`, `*`, `body`, `button`, `input`, `textarea`, `a`, `h1`, `h2`, `p`, `#root`;
- CSS Modules, Shadow DOM, CSS-in-JS и Tailwind не используются.

Риски для host app:

- global selectors вроде `body`, `button`, `input`, `a`, `h1` могут повлиять на host page;
- CSS variables в `:root` могут конфликтовать;
- `#root` привязан к standalone mode;
- нет style isolation для embedded mode.

Перед embedded mode нужно:

- ограничить global selectors областью контейнера microfrontend;
- заменить assumptions, связанные с `#root`, на container-level styles;
- решить, нужен ли Shadow DOM/Web Component;
- проверить z-index, portals, modals и scroll lock, если они появятся позже.

## 14. Error Handling

Сейчас error handling есть на уровне API/UI states:

- страницы показывают loading/error/empty states;
- `ApiError` есть в `src/shared/api/errors.ts`;
- TanStack Query errors выводятся через `getErrorMessage()`.

Not implemented yet:

- React error boundary вокруг microfrontend;
- `onError` callback для host app;
- fallback при failed remote loading;
- fallback при render error;
- centralized logging.

Для embedded mode ошибка внутри microfrontend не должна ломать всю host page. Host app должен иметь fallback для зоны, в которую монтируется microfrontend. Сам microfrontend должен иметь local error boundary и сообщать о critical errors через public contract.

## 15. Build and Deployment

Текущие scripts:

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run check
npm run build
npm run preview
```

Текущий build:

- `npm run build` выполняет `tsc -b && vite build`;
- output - `dist/`;
- standalone preview - `npm run preview`.

Build output для embedded mode отсутствует.

Не реализовано:

- `remoteEntry.js`;
- library mode build;
- Module Federation config;
- public CDN path;
- deployment manifest;
- runtime config injection.

Для embedded mode нужно решить, какой artifact публикуется для host app: remote module, library bundle, Web Component bundle, single-spa application или iframe URL.

## 16. Local Development

Текущий local workflow:

```bash
npm install
npm run dev
```

Проект запускается standalone через Vite dev server.

Будущий local integration scenario с host app:

1. Запустить marketplace app в standalone mode.
2. Запустить host app отдельно.
3. Настроить host app на загрузку local marketplace bundle или remote entry.
4. Проверить `mount()`.
5. Проверить `unmount()`.
6. Проверить routing внутри host route namespace.
7. Проверить cart persistence.
8. Проверить order persistence в demo mode.
9. Проверить error fallback в host app.

Not implemented yet:

- local host fixture;
- example host app;
- embedded dev command;
- integration smoke test.

## 17. Testing Strategy

Текущие tests:

- Vitest tests для cart business logic;
- schema tests для user/checkout validation;
- mock API/storage tests для user/order behavior.

Не покрыто:

- standalone render smoke test;
- mount/unmount contract;
- routing inside host app;
- host-to-microfrontend callbacks;
- microfrontend-to-host events;
- failed remote loading fallback;
- render error boundary;
- style isolation;
- local integration scenario.

Для embedded mode нужно добавить tests на public integration contract. React Testing Library или Playwright могут понадобиться позже, но сейчас не подключены.

## 18. Versioning and Compatibility

Breaking changes для host app:

- изменение `mountMarketplace()` signature;
- удаление или переименование `MarketplaceMountOptions` fields;
- изменение event/callback payloads;
- изменение route namespace;
- изменение required runtime config;
- изменение shared dependency requirements;
- изменение API assumptions;
- изменение exposed module name или remote entry location;
- изменение storage key semantics;
- изменение auth/user context contract.

Host app и microfrontend должны координировать такие изменения через versioned contract. Для storage keys уже используется `:v1`, но migration strategy не реализована.

## 19. Known Limitations

- Entry point для embedded mode не реализован.
- Public `mount`/`unmount` API не реализован.
- Module Federation config отсутствует.
- Web Component/single-spa/iframe setup отсутствует.
- `src/main.tsx` auto-renders в global `#root`.
- `BrowserRouter` владеет browser location в standalone mode.
- Runtime config и API base URL отсутствуют.
- Auth/user context не формализован.
- API сейчас mock-only, backend integration не реализована.
- `localStorage` persistence подходит только для demo mode.
- Storage adapter для host app не реализован.
- Глобальный CSS не изолирован от host app.
- Error boundary и host fallback contract не реализованы.
- Нет contract tests для embedded mode.

## 20. Integration Readiness Checklist

- [ ] Public mount/unmount API exists.
- [ ] Standalone mode still works.
- [ ] Embedded mode does not auto-render into a global root.
- [ ] Browser-only APIs are guarded.
- [ ] Routing is scoped.
- [ ] Host-to-microfrontend contract is documented.
- [ ] Microfrontend-to-host events/callbacks are documented.
- [ ] Runtime config is documented.
- [ ] Shared dependency strategy is defined.
- [ ] API contract is documented.
- [ ] Styling does not leak into host app.
- [ ] Error fallback is tested.
- [ ] Local integration scenario is documented.
- [ ] Versioning/breaking change rules are documented.
