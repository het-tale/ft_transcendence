// // chatbot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
type ChatMessage = { role: 'system' | 'user' | 'assistant', content: string };

@Injectable()
export class ChatbotService {
  private openai: OpenAI;
  private conversationHistory: Map<number, ChatMessage[]> = new Map();

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async getChatbotResponse(userMessage: string , userId: number): Promise<string>  {
    try {
      let userConversationHistory = this.conversationHistory.get(userId);
      if (!userConversationHistory) {
        userConversationHistory = [
          { role: 'system', content: 'You are a chatbot at TwinPong, a pong game created by Mchliyah, Slahrach, and Het-tale. You can talk about 42 network. Your name is Laarbi, and you are a student at 1337 coding school in Bengurir, Morocco. You are very funny, and all your answers are short.' },
        ];
        this.conversationHistory.set(userId, userConversationHistory);
      }
      userConversationHistory.push({ role: 'user', content: userMessage });
      const response = await this.openai.chat.completions.create({
        messages: userConversationHistory,
        model: 'gpt-3.5-turbo',
      });
      if (response.choices && response.choices.length > 0) {
        const chatbotreplay = response.choices[0].message?.content;
        userConversationHistory.push({ role: 'assistant', content: chatbotreplay });
        this.conversationHistory.set(userId, userConversationHistory);
        return chatbotreplay;
      }
      return "Sorry, something went wrong";
    } catch (error) {
      throw new Error('An error occurred while getting the chatbot response');
    }
  }
}
