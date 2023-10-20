import { User } from '@prisma/client';

export type TAchievement = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  icon: string;
  achievers: User[];
};
