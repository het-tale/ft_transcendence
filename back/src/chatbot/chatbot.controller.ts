import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post('message')
  async sendMessage(@Body() body: { message: string }): Promise<string> {
    const userMessage = body.message;
    const chatbotResponse = await this.chatbotService.getChatbotResponse(userMessage);
    return chatbotResponse;
  }
}
