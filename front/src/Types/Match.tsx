import { Channel } from './Channel';
import { UserType } from './User';

export type Match = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    start: Date;
    end: Date;
    PlayerA: UserType;
    PlayerAId: number;
    resultA: number;
    PlayerB: UserType;
    PlayerBId: number;
    resultB: number;
    winner: UserType;
    winnerId: number;
};
