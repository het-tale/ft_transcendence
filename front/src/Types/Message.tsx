import { Channel } from "./Channel";
import { UserType } from "./User";

export type MessageType = {
    id:       number;    
  createdAt: Date;
  updatedAt: Date;

  content: string;
  sentAt:  Date;

  isDM:     boolean;
  isPending: boolean;

  sender:     UserType;    
  senderId:   number;
  receiver:   UserType;   
  receiverId: number
  channel:    Channel;
  channelId:  number;
    
}