import { Controller, Body} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  async sendMessage(
    @Body() body: { message: string , userId: number},
  ): Promise<string> {
    const userMessage = body.message;
    const userId = body.userId;
    const chatbotResponse = await this.chatbotService.getChatbotResponse(userMessage, userId);
    return chatbotResponse;
  }
}
