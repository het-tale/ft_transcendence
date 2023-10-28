// chatbot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async getChatbotResponse(userMessage: string): Promise<string> {
    const userPrompt = [
      { role: 'system', content: 'You are a chatbot assistant for the PingPong game.' },
      { role: 'user', content: userMessage },
    ];

    try {
      const prompt = userPrompt.map((m) => `${m.role}: ${m.content}`).join('\n');
      const response = await this.openai.completions.create({
        model: 'text-davinci-002',
        prompt,
      });

      if (response.choices && response.choices.length > 0) {
        return response.choices[0].text;
      } else {
        throw new Error('Chatbot response is empty.');
      }
    } catch (error) {
      Logger.error('Error occurred while getting the chatbot response', error, 'ChatbotService');
      throw new Error('An error occurred while getting the chatbot response');
    }
  }
}
