import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { customPasswordValidator, customUsernameValidator } from './auth.dto';

export const nameSchema = z.object({
  name: customUsernameValidator.describe('name'),
});

export const roomSchema = z.object({
  name: customUsernameValidator.describe('channel name'),
  password: customPasswordValidator.optional().describe('password'),
  type: z.enum(['public', 'private', 'protected']),
});

export const adminSchema = z.object({
  name: customUsernameValidator.describe('name'),
  admin: customUsernameValidator.describe('admin username'),
});
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, { message: 'Required' })
      .describe('Old Password'),
    newPassword: customPasswordValidator.describe('New Password'),
    newPasswordConfirm: customPasswordValidator.describe('Confirm Password'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords don't match",
    path: ['newPasswordConfirm'],
  });

export class NameDto extends createZodDto(nameSchema) {}
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
export class RoomDto extends createZodDto(roomSchema) {}
export class AdminDto extends createZodDto(adminSchema) {}

export type Tname = z.infer<typeof nameSchema>;
export type TChangePassword = z.infer<typeof changePasswordSchema>;
export type Troom = z.infer<typeof roomSchema>;
export type Tadmin = z.infer<typeof adminSchema>;
