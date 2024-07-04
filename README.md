# GPT-chatbot
Telegram chatbot GPT client on telegraf

Чтобы использовать нужно:
 * сервер с поддержкой nodejs (можно запускать на рабочем компьютере)
 * Создать бота в телеграм с помощью https://telegram.me/botfatherпш
 * Создать api ключ gigachat api https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/gigachat-api

## Как запустить?
Прописать в .env ключи бота и openai ключ
Установить зависимости - `npm i`

Запустить index.js
`node index.js`

Команда для запуска с использованием pm2 :
`pm2 start server.json`
## Как использовать?
* перейти на бота
* нажать "запустить" или ввести команду `/start`
* можно вводить сообщения
* Для смены контекста команды `/start` или `/new`
