# ADR: server/mock state в TanStack Query

## Status

Accepted

## Context

Products, account data и orders приходят через API-like functions. Сейчас это mock API, позже это может стать real HTTP или MSW-backed layer.

## Decision

Использовать TanStack Query для products, user/account data и orders.

## Consequences

- Loading/error/empty states строятся вокруг queries.
- Mutations invalidate relevant query keys.
- Redux не хранит account/orders/products.
- Pages работают через API boundary, а не через `mock-data`.

## Limitations

- Сейчас API mock-only.
- Нет real backend, auth/session и production error contracts.
