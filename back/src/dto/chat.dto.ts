export type TDM = {
  to: string;
  message: string;
};

export type TCreateRoom = {
  // type: public | private | protected
  type: string | 'public' | 'private' | 'protected';
  room: string;
  password?: string;
};

export type TRoom = {
  room: string;
  password?: string;
};

export type TRoomMessage = {
  room: string;
  message: string;
};

export type TRoomTarget = {
  room: string;
  target: string;
};

export type TInvitation = {
  room: string;
  from: string;
  isAccepted: boolean;
};

export type TUserTarget = {
  target: string;
};

export type TFriendReq = {
  from: string;
  isAccepted: boolean;
};

export type TLeaveRoom = {
  room: string;
  newOwner?: string;
};
