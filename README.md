This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Поиск модификации по VIN на Python

Кнопка **«Найти по VIN»** запускает Python-декодер через сервер Next.js. По умолчанию сервер вызывает `python` из PATH. Если Python 3.10 или новее установлен в другом месте, задайте `AUTO_MATE_PYTHON_EXECUTABLE` в `.env.local` полным путём к исполняемому файлу. Если Python недоступен, форма использует поиск по тем же правилам в браузере.

Для отдельного запуска в админке откройте эталонный каталог и нажмите **«Скачать базу каталога»**. Запустите декодер из корня проекта с Python 3.10 или новее.

```powershell
python scripts/decode_vin.py "C:/путь/к/выгрузке.json" VIN_ИЗ_17_СИМВОЛОВ
```

Декодер выдаёт JSON с ID и характеристиками всех найденных модификаций, начиная с самых точных. Для 11-символьного префикса без `positions` пропускается индекс 8, а явная маска использует свои позиции. `modelYear: null` означает неизвестный год. `matched` означает одно совпадение, `ambiguous` — несколько, `no_match` — отсутствие совпадений по VIN-правилам. Отдельные зависимости не нужны.

При `no_match` декодер может вернуть `hint` — подсказку по коду версии BMW. Форма показывает подходящие карточки для ручного выбора. Начальные коды хранятся в `features/garage/add/lib/bmwTypeCodes.json`; браузер читает ту же таблицу, если Python недоступен.

Будущий поставщик подсказок подключается как `version_provider` в `decode_vin`. Функция получает `VersionQuery` с маркой, кодом версии, кодом производителя и рынком каталога и возвращает `VersionHint` либо `None`. Она вызывается только для поддерживаемой схемы BMW, если ни VIN-правила, ни локальный справочник не дали результата. Полный VIN остаётся в декодере. По умолчанию внешний поставщик не настроен.

## Поиск по номеру кузова (Frame)

В форме добавления автомобиля поле поиска принимает VIN или Frame. Для Frame используется формат `NZE141-1234567`: латинский код кузова с цифрами, разделитель и 5–8 цифр серийного номера. Frame сохраняется отдельно от VIN. Можно ввести только код кузова, например `GD1`: форма предложит выбор по полю «Код кузова» и правилам Frame в карточках модификаций, включая правила полного номера с этим кодом. Даже единственное совпадение требует выбора. Короткий код переносится в поле кода кузова и не сохраняется как полный Frame.

В поле `frame` импорта и в карточке модификации используется формат `sample` + `positions`, например `{"sample":"ZVW30-5148290","positions":[0]}`. Код кузова `ZVW30` сравнивается целиком, а индексы считаются с нуля после дефиса. Пустой массив проверяет только код кузова. Все позиции серийного номера дают точное совпадение. Можно передать `modelYear`. Результаты отсортированы от точного совпадения к маскам с меньшим числом проверяемых позиций и совпадениям только по коду. При нескольких кандидатах форма предлагает выбор. Каталог, заявки и выгрузки со старыми индексами читаются автоматически. Для старого JSON обучения укажите `"positionBasis":"sample"` в каждом старом правиле или пересчитайте индексы.
