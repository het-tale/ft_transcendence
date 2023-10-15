import { Channel } from './Channel';
import { UserType } from './User';

export type Notification = {
    type: string;
    from: string;
};

export type Invitation = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    isReceiverOnline: boolean;
    status: string;
    sender: UserType;
    senderId: number;
    receiver: UserType;
    receiverId: number;
    channel: Channel;
    channelId: number;
};
