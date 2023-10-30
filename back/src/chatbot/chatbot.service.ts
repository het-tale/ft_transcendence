// chatbot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async getChatbotResponse(userMessage: string ): Promise<string> {
    const userPrompt = [
      { role: 'chatbot', content: 'The following is a conversation with a chatbot assistant of enligne games and telling some jokes . The assistant is helpful, creative, clever, and very friendly.' },
      { role: 'user', content: userMessage },
    ];

    try {
      const prompt = userPrompt.map((m) => m.content);
      const response = await this.openai.completions.create({
        model: 'davinci-instruct-beta',
        prompt: prompt.join('\n'),
        temperature: 0.5,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.3,
        stop: '',
      });

      if (response.choices && response.choices.length > 0) {
        const chatbotResponse = response.choices[0].text;
        const chatbotResponseArray = chatbotResponse.split('\n');
        console.log('chatbotResponse', chatbotResponseArray);
        for (const message of chatbotResponseArray) {
          if (message.trim() !== '') {
            return message;
          }
        }
        console.log('chatbotResponse', chatbotResponseArray);
        return chatbotResponse;
      } else {
        throw new Error('Chatbot response is empty.');
      }
    } catch (error) {
      Logger.error('Error occurred while getting the chatbot response', error, 'ChatbotService');
      throw new Error('An error occurred while getting the chatbot response');
    }
  }
}
