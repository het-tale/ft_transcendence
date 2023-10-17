import { UserType } from './User';

export type Achievement = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    icon: string;
    description: string;
    rank: number | null;
    achievers: UserType[];
    offlineAchievers: UserType[];
};
