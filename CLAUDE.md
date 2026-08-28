<!-- astroblog capstone: используется в фазе 02. Копируется в корень проекта, затем /init дополняет техническими деталями Astro. -->

# CLAUDE.md

Автоматический AI-дайджест на Astro + Vercel. Проект курса Claude Code Basics.

## Стек

- Astro `^6.1.1` (`src/content/blog/` — статьи в markdown с frontmatter).
- Node `>=22.12.0` (из `engines` в `package.json`).
- Интеграции Astro: `@astrojs/mdx` (MDX в постах), `@astrojs/sitemap` (генерация `sitemap-index.xml` при билде), `@astrojs/rss` (RSS-фид из той же коллекции). Оптимизация изображений — `sharp` через `astro:assets`.
- SSR-адаптера пока нет — чистый статический билд. Если фаза курса потребует серверную логику, понадобится `@astrojs/vercel` и `output: 'server' | 'hybrid'` в `astro.config.mjs`.
- TypeScript strict (`astro/tsconfigs/strict` + `strictNullChecks`).
- Vercel (автодеплой на push в `main`).
- MCP: Tavily (поиск новостей), Replicate (обложки).

## Команды

- `npm run dev` — локальный сервер на `:4321`.
- `npm run build` — production-сборка.
- `npm run preview` — просмотр сборки.

## Структура статьи

Файл `src/content/blog/YYYY-MM-DD-slug.md` с frontmatter:

```yaml
---
title: Заголовок до 60 символов без точки
description: Одно предложение до 160 символов.
pubDate: 2026-04-23
cover: https://replicate.delivery/...
source: https://example.com/news
tags: [ai, llm]
---
```

## Редполитика

### Тематика

Новости AI, машинного обучения, больших языковых моделей. Инструменты для разработчиков и продуктовых менеджеров.

### Формат

- Заголовок: до 60 символов, без точки.
- Описание: одно предложение до 160 символов.
- Тело: 300–500 слов, 2–4 абзаца.
- Источник: обязательная ссылка на первоисточник.
- Обложка: URL от Replicate, соотношение 16:9.

### Обязательные поля frontmatter

`title`, `description`, `pubDate`, `cover`, `source` — все заполнены. Stop-хук (фаза 06) блокирует публикацию, если хоть одно поле пустое.

## Content Style

- Тон: разговорный и понятный, без панибратства.
- Лицо: первое лицо множественного числа («мы»).
- Максимальный объём: 500 слов.
- Без маркетинговых формулировок.
- Без эмодзи.
- Язык — русский.
- Предложения до 25 слов.
- Без шаблона «от X до Y» — перечислять конкретно.
- Без AI-маркеров: «погружаться», «ландшафт», «ключевой момент», «является свидетельством».

## Git

- Ветка по умолчанию `main`.
- С фазы 08 PreToolUse-хук блокирует прямой push в `main`. Автоматика коммитит в ветку `digest/auto`, слияние в `main` — вручную по желанию.
- Запрещены `git push --force`, `git reset --hard`, `git commit --amend`.
