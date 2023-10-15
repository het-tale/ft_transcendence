import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {SocialStartAchiever } from "src/dto/achievements.types";

@Injectable()
export class AchievementsService {
    constructor(private prisma: PrismaService) {}
    async check20friends(id: number)
    {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include:{
                friends: true,
            }
        });
        if (user.friends.length < 20)
            return false;
        const achievement = await this.prisma.achievement.findFirst({
            where: {
                name: SocialStartAchiever.name,
            },
            include: {
                achievers: true,
            },
        });
        const ifAchiever = achievement.achievers.find((ach) => ach.id === id);
        if(ifAchiever) return false;
        await this.prisma.achievement.update({
            where: {
                id: achievement.id,
            },
            data: {
                achievers: {
                    connect: {
                        id,
                    },
                },
            },
        });
        return true;
    }
}