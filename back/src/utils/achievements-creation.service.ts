import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AchievementService {
    constructor(
    private readonly prisma: PrismaService,
    private config: ConfigService) {}
    async createAchievements()
    {
        await this.prisma.achievement.create({
            data: {
                name: "Iron Curtain Crusher",
                description: "100lp !.You've smashed through the iron curtain and proved that you're not to be taken lightly. Keep climbing!",
                icon: this.config.get<string>("ICON_IRON") ?? "",
                rank: 6,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Bronze Bounce Master",
                description: "300lp !.You've mastered the art of the bounce! Your opponents better watch out, because you're on the rise!",
                icon: this.config.get<string>("ICON_BRONZE") ?? "",
                rank: 5,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Silver Paddle Prodigy",
                description: "600lp !.You've shown incredible skill and finesse with your paddle. You're on your way to pong greatness!",
                icon: this.config.get<string>("ICON_SILVER") ?? "",
                rank: 4,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Golden Ball Wizard",
                description: "900lp !.You've reached the pinnacle of pong excellence! Your golden touch has set you apart from the competition.",
                icon: this.config.get<string>("ICON_GOLD") ?? "",
                rank: 3,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Diamond Duelist",
                description: "1200lp !.You've become a true diamond in the rough, surpassing all expectations. Keep shining bright on the pong court!",
                icon: this.config.get<string>("ICON_DIAMOND") ?? "",
                rank: 2,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Master of the Pongiverse",
                description: "1500lp !.You've ascended to the highest echelon of pong mastery. You're a force to be reckoned with, and the pong world trembles in your presence!",
                icon: this.config.get<string>("ICON_MASTER") ?? "",
                rank: 1,
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "First Win",
                description: "Congratulations on winning your first match! You've shown your skills and proved to be an invaluable asset in the game of pong.!",
                icon: this.config.get<string>("ICON_WINNER") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "First Loss",
                description: "Congratulations on losing your first match! You've shown your skills and proved to be an invaluable asset in the game of pong.!",
                icon: this.config.get<string>("ICON_LOSER") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "The Unstoppable Block-nado",
                description: "You've become a force to be reckoned with! 20 users couldn't handle your chat prowess and resorted to blocking you. With the power of the 'Unstoppable Block-nado,' you leave a trail of blocked users in your wake!",
                icon: this.config.get<string>("ICON_TOXIC") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Social Pong Star",
                description: "Congratulations! You've made 20 amazing friends who love playing pong with you. Keep spreading the pong love!",
                icon: this.config.get<string>("ICON_EXTROVERT") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Channel Hopper Extraordinaire",
                description: "You've become a true master of channel hopping, joining 20 different channels. Keep exploring and connecting with the pong community!",
                icon: this.config.get<string>("ICON_CHANNEL") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Chat Chatterbox",
                description: "You've unleashed your inner chatterbox, sending 100 messages in the chat. Keep the conversations flowing and the pong banter alive!",
                icon: this.config.get<string>("ICON_CHATTER") ?? "",
            }
        });
        await this.prisma.achievement.create({
            data: {
                name: "Boundries Set",
                description : "Congratulations on setting your first block! By establishing boundaries, you're ensuring a positive and respectful chat experience for all.",
                icon: this.config.get<string>("ICON_BOUNDRIES") ?? "",
            }
        });
    }
}