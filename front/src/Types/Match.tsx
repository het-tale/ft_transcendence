import { UserType } from './User';

export type Match = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    start: Date;
    end: Date;
    playerA: UserType;
    playerAId: number;
    resultA: number;
    playerB: UserType;
    playerBId: number;
    resultB: number;
    winner: UserType;
    winnerId: number;
};
