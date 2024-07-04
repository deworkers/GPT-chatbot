const { Telegraf, session } = require('telegraf');
const GigaChat = require('gigachat-node').GigaChat;

require('dotenv').config();

const client = new GigaChat(process.env.GIGA_CHAT_KEY, true, true, true);
(async () => {
    await client.createToken();
})();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('new', async (ctx) => {
    await ctx.reply('Жду вашего сообщения');
});

bot.start(async (ctx) => {
    await ctx.reply('Жду вашего сообщения');
});

bot.catch((err, ctx) => {
    console.log(`Ошибка: ${ctx.updateType}`, err);
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    ctx.telegram
        .sendMessage(ctx.chat.id, '.', { parse_mode: 'Markdown' })
        .then(async (message) => {
            let loader = '.';

            let timer = setInterval(() => {
                if (loader.length < 3) {
                    loader += '.';
                } else {
                    loader = '.';
                }

                ctx.telegram.editMessageText(
                    ctx.chat.id,
                    message.message_id,
                    null,
                    loader,
                    { parse_mode: 'Markdown' }
                );
            }, 1000);

            let timeout = setTimeout(() => {
                // что-то сломалось, перезапускаем все принудительно
                clearInterval(timeout);
                ctx.telegram.sendMessage(
                    ctx.chat.id,
                    'Gigachat не отвечает больше минуты',
                    {
                        parse_mode: 'Markdown',
                    }
                );
            }, 60_000);

            console.log(text);

            await client
                .completion({
                    model: 'GigaChat:latest',
                    messages: [
                        {
                            content: text,
                            role: 'user',
                        },
                    ],
                })
                .then((responce) => {
                    ctx.telegram.editMessageText(
                        ctx.chat.id,
                        message.message_id,
                        null,
                        responce.choices[0].message.content,
                        { parse_mode: 'Markdown' }
                    );
                })
                .catch((error) => {
                    ctx.telegram
                        .editMessageText(
                            ctx.chat.id,
                            message.message_id,
                            null,
                            error,
                            { parse_mode: 'Markdown' }
                        )
                        .then(() => {
                            clearInterval(timer);
                        });
                })
                .finally(() => {
                    clearInterval(timer);
                    clearTimeout(timeout);
                });
        });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
