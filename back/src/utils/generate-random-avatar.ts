import { ConfigService } from '@nestjs/config';

export function generateRandomAvatar(config: ConfigService): string {
  const defaultAvatars = [
    config.get<string>('AVATAR1'),
    config.get<string>('AVATAR2'),
    config.get<string>('AVATAR3'),
    config.get<string>('AVATAR4'),
    config.get<string>('AVATAR5'),
    config.get<string>('AVATAR6'),
    config.get<string>('AVATAR7'),
    config.get<string>('AVATAR8'),
    config.get<string>('AVATAR9'),
    config.get<string>('AVATAR10'),
    config.get<string>('AVATAR11'),
    config.get<string>('AVATAR12'),
  ];

  // Generate a random index using Math.random()
  const randomAvatarIndex = Math.floor(Math.random() * defaultAvatars.length);
  const randomAvatar = defaultAvatars[randomAvatarIndex];

  return randomAvatar;
}
