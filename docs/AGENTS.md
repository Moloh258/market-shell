# AGENTS.md

Инструкции для Codex/AI agents, которые работают с этим проектом.

## Назначение проекта

`Marketplace Shell` - portfolio MVP клиентского marketplace microfrontend. Проект демонстрирует customer-facing сценарии: catalog, cart, account, checkout и orders.

Это не production marketplace. Сейчас используются mock API, нет real auth, real payment и real backend persistence.

## Tech stack

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- React Hook Form
- Zod
- Vitest

## Структура папок

- `src/app` - bootstrap, providers, routing, Redux store, typed hooks.
- `src/pages` - route-level pages.
- `src/widgets` - крупные UI/layout блоки.
- `src/entities` - domain types, API functions, business logic, Redux slice для cart.
- `src/shared` - common API helpers, `queryKeys`, `mock-data`, `ApiError`.
- `docs` - документация проекта.

## State ownership rules

- Cart - shared client/UI state, хранится в Redux Toolkit.
- Products, user/account data и orders - server/mock API state, обрабатываются через TanStack Query.
- Form state - локально в React Hook Form.
- Не добавлять Zustand, пока Redux Toolkit уже покрывает client state.
- Не класть account/orders/products в Redux.

## API boundary rules

- Pages не импортируют `mock-data` напрямую.
- Pages вызывают entity API functions: `getProducts()`, `getOrders()`, `getCurrentUser()`, `getUserAddresses()`, `createOrder()`.
- Mock data должна оставаться за API/repository boundary.
- Перед backend integration сохранить contracts в docs и TypeScript types.

## localStorage rules

- `localStorage` доступен только в storage/API layer, не в pages.
- Browser API всегда guard через `typeof window !== "undefined"`.
- Любой `JSON.parse`, `JSON.stringify`, `getItem`, `setItem`, `removeItem` должен быть безопасен через `try/catch`, если может упасть.
- Corrupted storage не должен ломать app.
- Использовать namespaced keys:
  - `marketplace-shell:cart:v1`
  - `marketplace-shell:orders:v1`

## Validation rules

- Runtime validation делается через Zod.
- React Hook Form подключается через `zodResolver`.
- TypeScript types не заменяют validation данных пользователя или storage.
- Validation errors должны быть видимы пользователю.

## Scope restrictions

Не реализовывать без отдельного approval:

- favorites;
- product comparison;
- AI shopping assistant;
- real authentication;
- real payment;
- real backend;
- крупный UI redesign;
- замену Redux Toolkit или TanStack Query.

Изменения должны быть маленькими, проверяемыми и привязанными к текущему milestone.

## Language rules

- User-facing UI text - русский.
- README/docs - русский.
- Technical names остаются на English: React, TypeScript, Redux Toolkit, TanStack Query, route paths, file paths, type names, function names, enum values.
- Не переводить `OrderStatus` и `PaymentMethod` values.
- Display labels должны быть отдельными mapping/strings, а не заменой domain values.

## Required verification commands

После изменений запускать:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Если команда падает, исправить проблему и запустить снова.

## Expected final report format

Финальный отчет должен содержать:

- changed files;
- что изменилось;
- почему выбранный подход подходит текущей архитектуре;
- verification results;
- что намеренно не реализовано;
- remaining limitations или next recommended step, если уместно.

Для review-only задач не менять файлы и явно сказать, что код не редактировался.
