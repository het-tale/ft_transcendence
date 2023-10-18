import { IsString, IsInt, IsNotEmpty, isEnum, isString, IsStrongPassword, Min, Max, IsBoolean } from 'class-validator';
import { IsEnum, IsOptional } from 'class-validator';
export class TDM {
  @IsString()
  @IsNotEmpty()
  to: string;
  @IsString()
  message: string;
};

export enum typeEnum {
  'public',
  'private',
  'protected',
};


export class TCreateRoom {
  @IsEnum(typeEnum)
  type: string;
  @IsNotEmpty()
  @IsString()
  @Min(3)
  @Max(20)
  room: string;
  @IsOptional()
  @IsStrongPassword()
  password?: string;
};

export class TRoom {
  @IsNotEmpty()
  @IsString()
  room: string;
  @IsOptional()
  @IsString()
  password?: string;
};

export class TRoomMessage {
  @IsString()
  @IsNotEmpty()
  room: string;
  @IsString()
  @IsNotEmpty()
  message: string;
};

export class TRoomTarget {
  @IsString()
  @IsNotEmpty()
  room: string;
  @IsString()
  @IsNotEmpty()
  target: string;
};

export class TInvitation {
  @IsString()
  @IsNotEmpty()
  room: string;
  @IsString()
  @IsNotEmpty()
  from: string;
  @IsBoolean()
  @IsNotEmpty()
  isAccepted: boolean;
};

export class TUserTarget {
  @IsString()
  @IsNotEmpty()
  target: string;
};

export class TFriendReq {
  @IsString()
  @IsNotEmpty()
  from: string;
  @IsString()
  @IsNotEmpty()
  isAccepted: boolean;
};

export class TLeaveRoom {
  @IsString()
  @IsNotEmpty()
  room: string;
  @IsString()
  @IsOptional()
  newOwner?: string;
};
