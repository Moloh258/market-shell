# ADR: cart state в Redux Toolkit

## Status

Accepted

## Context

Cart нужен на нескольких экранах: catalog, header, cart page и checkout. Состояние должно поддерживать add, increment, decrement, remove, clear, subtotal и total quantity.

## Decision

Хранить cart как client/UI state в Redux Toolkit.

## Consequences

- Redux Toolkit остается единственным source of truth для cart.
- `localStorage` используется только как persistence layer.
- Selectors считают derived data.
- Не добавляем Zustand, чтобы не смешивать state managers.

## Limitations

- Cart не является backend contract.
- Prices в cart - preview-only.
- Production checkout должен пересчитывать cart на backend.
