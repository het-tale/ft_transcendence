import {
  IsString,
  IsNotEmpty,
  IsStrongPassword,
  IsBoolean,
  IsEnum,
  IsOptional,
  ValidateIf,
  Matches,

} from 'class-validator';

export class TUsername {
  //no special characters
  @Matches(/^[a-zA-Z0-9._-]{3,15}$/, {
    message:
      'Username must contain at least 3 characters and no special characters except . _ - max 15 characters',
  })
  name: string;
}
export class TDM {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsString()
  message: string;
}

export enum typeEnum {
  'public',
  'private',
  'protected',
}


export class TCreateRoom {
  @IsEnum(typeEnum, { message: 'type must be public, private or protected' })
  type: string;

  @Matches(/^[a-zA-Z0-9._-]{3,15}$/, {
    message:
      'Room name must contain at least 3 characters and no special characters except . _ - max 15 characters',
  })
  room: string;

  @IsStrongPassword()
  @ValidateIf((o) => o.type === 'protected')
  password?: string;
}

export class TRoom {
  @IsNotEmpty()
  @IsString()
  room: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class TRoomMessage {
  @IsNotEmpty()
  @IsString()
  room: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

export class TRoomTarget {
  @IsNotEmpty()
  @IsString()
  room: string;

  @IsNotEmpty()
  @IsString()
  target: string;
}

export class TInvitation {
  @IsNotEmpty()
  @IsString()
  room: string;

  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsBoolean()
  isAccepted: boolean;
}

export class TUserTarget {
  @IsNotEmpty()
  @IsString()
  target: string;
}

export class TFriendReq {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsBoolean()
  isAccepted: boolean;
}

export class TLeaveRoom {
  @IsNotEmpty()
  @IsString()
  room: string;

  @IsOptional()
  @IsString()
  newOwner?: string;
}
