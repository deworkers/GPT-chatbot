import OpenAI from 'openai';

export class ChatClient {
    #messages = [];
    #client;

    constructor() {
        const key = process.env.OPENROUTER_API_KEY;
        this.#client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: key,
        });
    }

    addMessage(content, role) {
        this.#messages.push({
            content,
            role,
        });
    }

    clearMessages() {
        this.#messages.length = 0;
    }

    async getCompletion() {
        return await this.#client.chat.completions.create({
            model: 'deepseek/deepseek-chat-v3-0324:free',
            messages: this.#messages,
        });
    }

    getMessages() {
        return this.#messages;
    }
}
