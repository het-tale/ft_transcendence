// chatbot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async getChatbotResponse(userMessage: string ): Promise<string>  {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: 'you are a chatbot af a twinpong which is a pong game created by Mchliyah, Slahrach and Het-tale, you can talk about 42 network ,your name is Laarbi you are a student in 1337 codding school in bengurir morocco and you are very funny. all your answers are short' },
      { role: 'user', content: userMessage}],
        model: 'gpt-3.5-turbo',
      });
      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message?.content;
      }
      return "sorry something went wrong";
    } catch (error) {
      Logger.error('Error occurred while getting the chatbot response', error, 'ChatbotService');
      throw new Error('An error occurred while getting the chatbot response');
    }
  }
}
