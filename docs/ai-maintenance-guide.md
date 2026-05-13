# AI maintenance guide

Этот документ описывает, как использовать Codex для будущей поддержки проекта. Он не объясняет прошлую работу и не оправдывает использование AI. Это операционная инструкция для новых задач.

## 1. Pre-task checkpoint

Перед началом задачи:

```bash
git status --short
```

Проверь:

- есть ли незакоммиченные изменения;
- какие файлы уже изменены человеком;
- не лежат ли рядом unrelated changes;
- понятно ли, что входит в текущую задачу.

Если working tree грязный, не откатывай чужие изменения. Работай только с файлами, которые нужны для задачи.

## 2. Сначала audit и plan

Для нетривиальной задачи попроси Codex сначала сделать audit:

- какие файлы относятся к задаче;
- какие contracts/types уже существуют;
- где сейчас state ownership;
- какие риски есть;
- какие файлы планируется менять.

Хорошая формулировка:

```text
Сначала проведи audit и предложи plan. Не редактируй файлы, пока я не approve.
```

Для маленьких cleanup-задач можно сразу разрешать implementation, но scope должен быть явным.

## 3. Approve implementation

Перед implementation проверь plan:

- не добавляет ли он лишние features;
- не меняет ли architecture без причины;
- не смешивает ли Redux Toolkit и TanStack Query responsibilities;
- не импортируют ли pages `mock-data`;
- не появляется ли прямой `localStorage` access в UI.

Если plan слишком широкий, сузь задачу до маленького milestone.

## 4. Quality gates

После изменения кода или документации запускать:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Для быстрых промежуточных проверок можно использовать:

```bash
npm run check
```

Но перед финальным acceptance все четыре команды выше должны пройти.

## 5. Manual review checklist

После implementation проверь:

- scope: не появились favorites/comparison/AI/auth/payment без approval;
- state ownership: cart в Redux Toolkit, server/mock data в TanStack Query;
- API boundary: pages не импортируют `mock-data`;
- localStorage safety: browser guard, `try/catch`, validation;
- validation: Zod schemas соответствуют form requirements;
- UX states: loading, error, empty states сохранены;
- docs: README/docs не обещают production readiness;
- language: UI и docs на русском, technical identifiers на English.

## 6. Post-implementation review

Для важных milestones проси отдельный strict review:

```text
Проведи strict post-implementation review. Не меняй код.
Проверь state ownership, API boundary, validation, tests, scope control и risks.
```

Review должен сначала перечислять issues, затем confirmed good, затем suggested fixes.

## 7. Cleanup

После review применяй только small cleanup fixes:

- исправить medium/minor issues;
- не начинать следующий milestone;
- не расширять scope;
- снова запустить quality gates.

Если cleanup начинает превращаться в feature work, остановись и вынеси это в отдельный milestone.

## 8. Commit

Перед commit:

```bash
git status --short
npm run typecheck
npm run lint
npm run test
npm run build
```

Проверь, что commit содержит только файлы текущей задачи. Не добавляй `dist`, `node_modules`, `.env`, logs или временные файлы.

## 9. Хорошие задачи для Codex

Codex хорошо подходит для:

- audit текущей архитектуры;
- small refactors;
- добавления tests;
- написания docs;
- проверки API boundaries;
- поиска unsafe browser API access;
- подготовки manual testing checklist;
- review на regressions и scope creep.

## 10. Что человек должен проверять вручную

Человек должен принимать решения по:

- product scope;
- UX copy и русский tone;
- backend/API contract agreement;
- security assumptions;
- portfolio positioning;
- commit boundaries.

AI может ускорить работу, но acceptance зависит от human review и verification.
