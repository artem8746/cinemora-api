# Company Enrichment MVP

## Назначение

Этот функционал обогащает данные о компании из вакансии и сохраняет профиль компании отдельно от вакансий.
Цель: снизить количество внешних вызовов (LLM/сайт), ускорить повторные сохранения и не ломать сохранение вакансии при ошибках внешних сервисов.

---

## Что добавлено в модель данных

### `companies`

- `id: uuid`
- `displayName: string` — отображаемое имя компании
- `normalizedName: string` — нормализованное имя для дедупликации (unique)
- `domain: string | null` — домен компании
- `pageUrl: string | null` — ссылка на страницу компании (если найдена в источниках)
- `description: string | null` — краткое описание компании
- `industry: string | null`
- `headquarters: string | null`
- `size: string | null`
- `reviewsSummary: { rating, pros, cons, sampleSize, source } | null`
- `confidence: number` — значение от `0` до `1`
- `lastVerifiedAt: Date | null`
- `nextRefreshAt: Date | null`
- `createdAt: Date`
- `updatedAt: Date`

### `vacancies`

- `companyId: uuid | null` — FK на `companies`
- `company?: Company | null` — relation, доступен в ответах при чтении вакансий

### `company_sources`

Техническая таблица сырых источников enrichment:

- `id: uuid`
- `companyId: uuid`
- `sourceType: 'vacancy_text' | 'company_website'`
- `sourceUrl: string`
- `payload: jsonb`
- `collectedAt: Date`

Retention: записи старше **30 дней** удаляются фоново.

---

## Бизнес-flow (DB first)

При сохранении **новой** вакансии:

1. Берется `parsedData.company`.
2. Имя нормализуется (`trim`, `lowercase`, удаление legal suffix, схлопывание пробелов).
3. По `normalizedName` ищется компания в БД.
4. Если нет — создается минимальная запись компании (`first-write-wins` через insert-or-ignore).
5. Вакансия сохраняется с `vacancy.companyId`.
6. Проверяется свежесть:
   - если `nextRefreshAt > now` -> `cache_hit`, enrichment не запускается;
   - иначе -> `cache_miss`, enrichment запускается в фоне.

Важно: сохранение вакансии не должно падать из-за ошибок website/LLM.

---

## Как работает enrichment

Фоновый процесс:

1. Берет lock в Redis по `normalizedName`, чтобы не запускать дубли.
2. Логирует `enrichment_started`.
3. Сохраняет source с текстом вакансии в `company_sources`.
4. Пытается получить контент сайта компании.
5. Сохраняет website source в `company_sources` (если доступен).
6. Вызывает `OpenAIService.summarizeCompanyProfile(...)`:
   - `response_format: json_object`
   - `temperature: 0`
   - используется только переданный контент
   - контекст ограничивается (~15k символов)
7. Обновляет поля компании (`description`, `industry`, `headquarters`, `size`, `reviewsSummary`, `confidence`, даты refresh).
8. Логирует `enrichment_completed` или `enrichment_failed`.

---

## TTL и обновление

- Профиль компании: **30 дней**
- Reviews: **14 дней**
- Для решения “обновлять или нет” используется `nextRefreshAt`:
  - если время еще не пришло -> кэш считается актуальным;
  - если пришло -> запускается фоновое обновление.

---

## Обязательные логи

- `cache_hit`
- `cache_miss`
- `enrichment_started`
- `enrichment_completed`
- `enrichment_failed`

---

## Как использовать на фронтенде

Фронтенд получает профиль компании через поле `vacancy.company`.

Рекомендация по отображению:

- карточка компании:
  - `displayName`
  - `industry`
  - `domain`
  - `pageUrl` (кнопка/ссылка "Сайт компании")
  - `description`
- блок отзывов (если есть `reviewsSummary`)
- бейдж уверенности на основе `confidence`:
  - `>= 0.75` — высокая
  - `0.4..0.74` — средняя
  - `< 0.4` — низкая

Fallback:

- если `vacancy.company == null`, блок компании не показывать;
- если часть полей `null`, рендерить только доступные поля.

---

## Зачем каждый функционал

- `normalizedName` — дедуп компаний, экономия enrichment.
- `companyId` в вакансии — явная связь vacancy -> company.
- `company_sources` — отладка, аудит и повторное обогащение без повторных внешних запросов.
- lock по компании — защита от параллельных дублей.
- TTL — контроль стоимости и частоты обновлений.
- `confidence` — индикатор качества данных для UI и бизнес-логики.
- фоновый enrichment — стабильность основного потока сохранения вакансий.
