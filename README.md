# GPT-chatbot
Telegram chatbot GPT client on telegraf

Чтобы использовать нужно:
 * сервер с поддержкой nodejs (можно запускать на рабочем компьютере)
 * Создать бота в телеграм с помощью https://telegram.me/botfather
 * Создать api ключ https://platform.openai.com/account/api-keys (нужен подтвержденный аккаунт)

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
