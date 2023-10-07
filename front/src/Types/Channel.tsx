import { type } from 'os';
import { UserType } from './User';
import { MessageType } from './Message';
import { Invitation } from './Invitation';

export type Channel = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    type: string;
    hash: string;
    owner: UserType;
    ownerId: number;
    isDeleted: boolean;
    messages: MessageType[];
    participants: UserType[];
    offlineKicked: UserType[];
    admins: UserType[];
    banned: UserType[];
    offlineUnbanned: UserType[];
    muted: UserType[];
    invitations: Invitation[];
};
