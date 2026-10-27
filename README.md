# 2GIS Tilda Reviews

Универсальный блок отзывов 2ГИС для Tilda T123. В основном способе установки **CSS остаётся прямо в T123**, а HTML-разметку и JavaScript автоматически создаёт CDN-файл `dist/embed.js`. Код независим от CMS-библиотек, не требует своего сервера.

> Неофициальная интеграция. Доступность публичного API 2ГИС, ключа по умолчанию, CORS и пагинации не гарантируется. Перед использованием проверьте условия 2ГИС, особенно для выборочного показа отзывов.

## 1. Готовый код для T123 (скопировать целиком)

Откройте в Tilda блок **T123 → HTML**. Скопируйте **весь блок ниже**. В первой строке `<section>` замените `YOUR_BRANCH_ID` на числовой ID вашей организации в 2ГИС. Больше ничего менять для базовой установки не нужно. GitHub отображает кнопку копирования у кодового блока.

```html
<!-- УКАЖИТЕ ID ФИЛИАЛА 2ГИС ТОЛЬКО ЗДЕСЬ -->
<section class="clinic-reviews" data-clinic-reviews data-branch-id="YOUR_BRANCH_ID" data-display-limit="6" data-search-limit="200" data-positive-min="4"></section>

<style>
 .clinic-reviews{--cr-accent:#24785e;box-sizing:border-box;max-width:1160px;margin:0 auto;padding:48px 24px;font-family:var(--t-text-font, Arial);color:#203b32;background:#faf3e1;border-radius:24px}
 .clinic-reviews *{box-sizing:border-box}
 .clinic-reviews .cr-header{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:24px}
 .clinic-reviews .cr-label{margin:0 0 12px;font-size:18px;color:#004341; border:1px solid #004341;border-radius:20px;display:flex;width:fit-content;padding:5px 15px}
 .clinic-reviews h2{margin:0;font-size:clamp(26px,4vw,40px);line-height:1.15;font-weight:800}
 .clinic-reviews .cr-link{display:inline-block;flex-shrink:0;padding:14px 20px;border:1px solid #b9ccc1;border-radius:100px;color:var(--cr-accent)!important;text-decoration:none!important;font-size:14px}
 .clinic-reviews .cr-summary{margin:0 0 24px;font-size:18px;line-height:1.5}
 .clinic-reviews .cr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
 .clinic-reviews .cr-card{min-width:0;padding:24px;border:1px solid #e0e8df;border-radius:18px;background:#fff;box-shadow:0 5px 10px #0043411a}
 .clinic-reviews .cr-author{margin:0 0 8px;font-size:16px;font-weight:600;overflow-wrap:anywhere}
 .clinic-reviews .cr-date{color:#687970;font-size:12px}
 .clinic-reviews .cr-stars{color:#f0a810;letter-spacing:3px;margin:16px 0 12px;font-size:20px}
 .clinic-reviews .cr-text{margin:0;font-size:18px;line-height:1.2;white-space:pre-wrap;overflow-wrap:anywhere}
 .clinic-reviews .cr-text.cr-short{display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden;max-height:9.9em}
 .clinic-reviews .cr-more{margin-top:12px;padding:4px 0;border:0;background:none;color:var(--cr-accent);font:inherit;font-size:14px;text-decoration:underline;cursor:pointer}
 .clinic-reviews .cr-note,.clinic-reviews .cr-status{font-size:12px;line-height:1.5;color:#687970;margin:20px 0 0}
 .clinic-reviews :focus-visible{outline:2px solid var(--cr-accent);outline-offset:4px}
 .star{color:#f0a810;margin-right:4px}
 .dg-icon{width:25px;height:25px;vertical-align:middle;object-fit:contain}
 @media(max-width:900px){.clinic-reviews .cr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:600px){.clinic-reviews{padding:32px 16px;border-radius:16px}.clinic-reviews .cr-header{align-items:flex-start;flex-direction:column;gap:18px}.clinic-reviews .cr-grid{display:flex;overflow-x:auto;scroll-snap-type:x proximity;padding-bottom:12px}.clinic-reviews .cr-card{flex:0 0 88%;scroll-snap-align:start;padding:20px}}
 /* Единственное дополнение: оформление кнопки загрузки */
 .clinic-reviews .cr-actions{display:flex;justify-content:center;margin-top:26px}
 .clinic-reviews .cr-load-more{appearance:none;cursor:pointer;border:1px solid var(--cr-accent);color:var(--cr-accent);background:transparent;border-radius:100px;padding:13px 27px;font:600 15px/1.3 var(--t-text-font,Arial);transition:background .2s,color .2s,opacity .2s}
 .clinic-reviews .cr-load-more:hover{background:var(--cr-accent);color:#fff}
 .clinic-reviews .cr-load-more:disabled{opacity:.55;cursor:wait}
 .clinic-reviews .cr-load-more[hidden]{display:none}
</style>

<!-- HTML отзывов и логика подгружаются из GitHub CDN -->
<script defer src="https://cdn.jsdelivr.net/gh/DiasMazhenov/2GIS-tilda-reviews@main/dist/embed.js"></script>
```

Также этот же код доступен отдельным файлом: [tilda-css-only.html](./tilda-css-only.html). Его удобно копировать одной командой.

**Важно:** не подключайте файл `tilda-block.html` через `<script src>`! В нём находятся HTML, CSS и JavaScript одновременно. Для варианта выше нужен именно `dist/embed.js`.

## 2. Где взять ID филиала

Откройте страницу организации в 2ГИС. Например, для URL `https://2gis.kz/firm/70000001101966397/tab/reviews` ID равен `70000001101966397`. В шаблоне заменяется **только одно значение**:

```html
<section class="clinic-reviews" data-clinic-reviews data-branch-id="70000001101966397" data-display-limit="6" data-search-limit="200" data-positive-min="4"></section>
```

Ссылка «Все отзывы в 2ГИС» строится автоматически из `data-branch-id`.

## 3. Варианты подключения на страницах врачей

Если на странице есть текстовый элемент с **CSS-классом `doctor`**, отдельный маркер не нужен. В Tilda Zero Block задайте этому элементу CSS Class Name = `doctor`. Содержимое текста должно быть ФИО, например «Босатбеков Еркебулан Нурланулы».

Пример обычной HTML-разметки:

```html
<h1 class="doctor">Босатбеков Еркебулан Нурланулы</h1>
```

Если в Zero Block неудобно назначить класс, добавьте отдельный T123 на страницу врача и передайте ФИО явно:

```html
<div data-gis-doctor-reviews data-doctor-name="Босатбеков Еркебулан Нурланулы" hidden></div>
```

Или передайте CSS-селектор вашего элемента с ФИО:

```html
<div data-gis-doctor-reviews data-doctor-selector=".doctor-name" hidden></div>
```

Скрипт проверяет до `data-search-limit` отзывов, учитывает фамилию или сочетание имени с отчеством рядом, чтобы снизить риск совпадений с тёзками. Простое совпадение по имени не засчитывается. Совпавшие слова в отзывах выделяются жирным. Если отзывов о враче не найдено, показываются общие отзывы клиники с оценками от 4 звёзд, без поясняющей подписи. Это не гарантирует точную идентификацию человека.

## 4. Настройки в T123

Настройки меняются в открывающем теге `<section>`:

| Атрибут | Значение | Для чего |
| --- | --- | --- |
| `data-branch-id` | обязательный ID | Филиал 2ГИС |
| `data-display-limit` | `6` | Количество карточек при открытии |
| `data-search-limit` | `200` | Максимум просматриваемых отзывов при поиске врача |
| `data-positive-min` | `4` | Минимальная оценка резервных отзывов |
| `data-api-key` | не обязателен | Переопределение встроенного публичного ключа виджета |
| `data-title` | не обязателен | Заголовок блока |
| `data-subtitle` | не обязателен | Подпись над заголовком |

Например, чтобы изначально показать 9 отзывов:

```html
<section class="clinic-reviews" data-clinic-reviews data-branch-id="70000001101966397" data-display-limit="9" data-search-limit="200" data-positive-min="4"></section>
```

CSS полностью остаётся под вашим контролем в T123. Меняйте фон, шрифты, отступы и цвета в `<style>`, не редактируя GitHub. Кнопка **«Загрузить еще»** добавляет до трёх карточек за нажатие, если есть следующие отзывы. На мобильном блоке карточки прокручиваются горизонтально.

## 5. Автообновление через CDN

В T123 подключена строка:

```html
<script defer src="https://cdn.jsdelivr.net/gh/DiasMazhenov/2GIS-tilda-reviews@main/dist/embed.js"></script>
```

Правки файла `dist/embed.js` в ветке `main` автоматически станут доступны сайту **после обновления кеша jsDelivr**. Время распространения изменений не гарантируется. Файл `tilda-block.html` отдельно не влияет на CDN-вариант: при изменениях поддерживайте `dist/embed.js` в актуальном состоянии. Локальные CSS-правки по-прежнему делаются в T123.

## 6. Проверка и диагностика

1. Опубликуйте страницу Tilda. Проверяйте именно опубликованный сайт.
2. Если пусто, откройте инструменты разработчика → Network и проверьте запросы к `public-api.reviews.2gis.com`.
3. При HTTP 401/403 проверьте доступность ключа. Встроенный публичный ключ не гарантирован для других организаций и сайтов. Ключ **не** извлекается автоматически по ID филиала.
4. При ошибке CORS разрешение должен дать API-сервер, браузерный код Tilda её не обходит.
5. Если на странице врача показаны общие отзывы, проверьте наличие `.doctor`, текст ФИО и совпадения в проверенной выборке. Для проверки можно использовать:

```js
({
  doctor: document.querySelector('.doctor')?.textContent.trim(),
  highlighted: document.querySelectorAll('.cr-text strong').length,
  reviews: document.querySelectorAll('.cr-card').length
})
```

Скрипт обновляет отзывы раз в 5 минут, пока вкладка видима и пользователь не взаимодействует с блоком. Поддержка параметра `offset` у стороннего API может быть ограничена, поэтому кнопка загрузки следующих отзывов и поиск в большом архиве зависят от поведения сервиса.

## Файлы проекта

- [tilda-css-only.html](./tilda-css-only.html) — **рекомендуемый** готовый T123, CSS локально.
- [dist/embed.js](./dist/embed.js) — создаёт HTML и загружает отзывы через CDN.
- [tilda-block.html](./tilda-block.html) — альтернативная автономная версия HTML + CSS + JS.
- [tilda-cdn.html](./tilda-cdn.html) и [dist/reviews.js](./dist/reviews.js) — альтернативный вариант с локальной HTML-разметкой.
- [examples/doctor-marker.html](./examples/doctor-marker.html) — дополнительные маркеры для страниц врачей.
