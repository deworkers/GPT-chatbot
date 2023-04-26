const { Telegraf, session } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

class OpenAI {
    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPEN_AI,
        });
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            });

            return response.data.choices[0].message;
        } catch (error) {
            console.log(error.message);
        }
    }
}

const SESSION = {
    messages: [],
};

const bot = new Telegraf(process.env.BOT_TOKEN);
const openai = new OpenAI();
bot.use(session(SESSION));

bot.command('new', async (ctx) => {
    ctx.session.messages = [];
    await ctx.reply('Жду вашего сообщения');
});

bot.start(async (ctx) => {
    ctx.session.messages = [];
    await ctx.reply('Жду вашего сообщения');
});

bot.on('text', async (ctx) => {
    if (ctx.session.messages === undefined) {
        ctx.session = SESSION;
    }

    const text = ctx.message.text;

    ctx.telegram
        .sendMessage(ctx.chat.id, '.', { parse_mode: 'Markdown' })
        .then(async (message) => {
            ctx.session.messages.push({
                role: 'user',
                content: text,
            });

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

            const response = await openai.chat(ctx.session.messages);

            ctx.session.messages.push({
                role: 'assistant',
                content: response.content,
            });

            ctx.telegram
                .editMessageText(
                    ctx.chat.id,
                    message.message_id,
                    null,
                    response.content,
                    { parse_mode: 'Markdown' }
                )
                .then(() => {
                    clearInterval(timer);
                });
        });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
