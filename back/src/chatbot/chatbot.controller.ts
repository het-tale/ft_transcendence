import { Controller, Post, Body, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  async sendMessage(
    @Body() body: { message: string },
    @Query('model') model: string,
    @Query('temperature') temperature: number,
  ): Promise<string> {
    const userMessage = body.message;
    const chatbotResponse = await this.chatbotService.getChatbotResponse(userMessage, model, temperature);
    return chatbotResponse;
  }
}
