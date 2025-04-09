import pkg from 'telegraf';
const { Telegraf } = pkg;

import 'dotenv/config';
import { ChatClient } from './client.js';

const bot = new Telegraf(process.env.BOT_TOKEN);
const client = new ChatClient();

const systemPrompt = `
Ты — опытный помощник по JavaScript и веб-разработке. Отвечай на русском языке. 
Не используй в ответе разметку Markdown кроме выделения кода. Работает только разметка для Telegram
Пользователь будет присылать тебе код на JavaScript, фрагменты ошибок или описания проблем.
Твоя задача — кратко и понятно объяснить, в чём проблема, и по возможности предложить решение.
Если тебе прислали только текст ошибки — постарайся объяснить её причину и как её можно исправить.
Если тебе прислали код — проанализируй его и укажи на возможные ошибки, недочёты или улучшения.
Отвечай чётко, без лишней «воды», но дружелюбно.
Если информации недостаточно — задай уточняющие вопросы.
`;

bot.start(async (ctx) => {
    client.clearMessages();
    client.addMessage(systemPrompt, 'system');
    await ctx.reply('Жду вашего сообщения');
});

bot.catch((err, ctx) => {
    console.log(`Ошибка: ${ctx.updateType}`, err);
});

bot.command('clear', async (ctx) => {
    client.clearMessages();
    client.addMessage(systemPrompt, 'system');
    await ctx.reply('История сообщений очищена');
});

let messageBufer = '';

bot.on('message', async (ctx) => {
    if (ctx.message.forward_from || ctx.message.forward_from_chat) {
        messageBufer = ctx.message.caption;

        return ctx.reply('Выберите действие:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📌 Суммаризировать',
                            callback_data: 'summarize',
                        },
                        {
                            text: '🌍 Перевести EN->RU',
                            callback_data: 'translate',
                        },
                    ],
                ],
            },
        });
    } else {
        const text = ctx.message.text;

        ctx.telegram
            .sendMessage(ctx.chat.id, '.', { parse_mode: 'Markdown' })
            .then(async (message) => {
                let loader = '.';
                let timer = setInterval(() => {
                    loader = loader.length < 3 ? loader + '.' : '.';
                    ctx.telegram.editMessageText(
                        ctx.chat.id,
                        message.message_id,
                        null,
                        loader,
                        { parse_mode: 'Markdown' }
                    );
                }, 1000);

                let timeout = setTimeout(() => {
                    clearInterval(timer);
                    ctx.telegram.sendMessage(
                        ctx.chat.id,
                        'Gigachat не отвечает больше минуты',
                        { parse_mode: 'Markdown' }
                    );
                }, 60_000);

                client.addMessage(text, 'user');

                await client
                    .getCompletion()
                    .then((response) => {
                        const reply = response.choices[0].message.content;
                        ctx.telegram.editMessageText(
                            ctx.chat.id,
                            message.message_id,
                            null,
                            reply,
                            { parse_mode: 'Markdown' }
                        );
                        client.addMessage(reply, 'assistant');
                    })
                    .catch((error) => {
                        ctx.telegram.editMessageText(
                            ctx.chat.id,
                            message.message_id,
                            null,
                            error,
                            { parse_mode: 'Markdown' }
                        );
                    })
                    .finally(() => {
                        clearInterval(timer);
                        clearTimeout(timeout);
                    });
            });
    }
});

// Обработчик нажатий на кнопки меню
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (!messageBufer) return ctx.answerCbQuery('Ошибка: сообщение не найдено');

    const originalText = messageBufer;
    let prompt;

    client.clearMessages();

    if (data === 'summarize') {
        prompt = `Суммаризируй следующий текст, выделяя главные тезисы:\n\n${originalText}`;
        client.addMessage(prompt, 'user');
    } else if (data === 'translate') {
        prompt = `Переведи с английского на русский:\n\n${originalText}`;
        client.addMessage(prompt, 'user');
    }

    if (!prompt) return ctx.answerCbQuery('Ошибка: неизвестная команда');

    await ctx.answerCbQuery('Обрабатываем запрос...');
    ctx.telegram.sendMessage(ctx.chat.id, '⏳ Обрабатываю...');

    messageBufer = '';

    await client
        .getCompletion()
        .then((response) => {
            ctx.telegram.sendMessage(
                ctx.chat.id,
                response.choices[0].message.content,
                { parse_mode: 'Markdown' }
            );
            client.clearMessages();
        })
        .catch(() => {
            ctx.telegram.sendMessage(
                ctx.chat.id,
                '⚠ Ошибка при обработке запроса'
            );
        });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
