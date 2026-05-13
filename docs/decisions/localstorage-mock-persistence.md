# ADR: localStorage-backed mock persistence

## Status

Accepted for demo mode

## Context

Для локального demo нужно, чтобы cart переживал reload, а созданные mock orders не исчезали сразу после обновления страницы.

## Decision

Использовать namespaced `localStorage` keys:

- `marketplace-shell:cart:v1`
- `marketplace-shell:orders:v1`

Storage access держать в storage/API layer, не в pages.

## Consequences

- Demo становится удобнее без real backend.
- Corrupted storage безопасно fallback-ится.
- Browser API guarded через `typeof window !== "undefined"`.
- Write failures для orders считаются failed order creation.

## Limitations

- Это не production persistence.
- Production orders должен хранить backend.
- Перед embedding нужно согласовать storage ownership с host app.
