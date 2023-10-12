import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const nameSchema = z.object({
  name: z.string().trim().min(1, { message: 'Required' }).describe('name'),
});

export const roomSchema = z.object({
  name: z.string().trim().min(1, { message: 'Required' }).describe('name'),
  password: z
    .string()
    .trim()
    .min(1, { message: 'Required' })
    .describe('name')
    .optional(),
  type: z.enum(['public', 'private', 'protected']),
});
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, { message: 'Required' })
      .describe('Old Password'),
    newPassword: z
      .string()
      .trim()
      .min(8, { message: 'Required' })
      .describe('New Password'),
    newPasswordConfirm: z
      .string()
      .trim()
      .min(8, { message: 'Required' })
      .describe('New Password Confirm'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords don't match",
    path: ['newPasswordConfirm'],
  });

export class NameDto extends createZodDto(nameSchema) {}
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
export class RoomDto extends createZodDto(roomSchema) {}

export type Tname = z.infer<typeof nameSchema>;
export type TChangePassword = z.infer<typeof changePasswordSchema>;
export type Troom = z.infer<typeof roomSchema>;
