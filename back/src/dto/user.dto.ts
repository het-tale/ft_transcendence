import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const UsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: 'Required' })
    .describe('Username'),
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

export class UsernameDto extends createZodDto(UsernameSchema) {}
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}

export type TUsername = z.infer<typeof UsernameSchema>;
export type TChangePassword = z.infer<typeof changePasswordSchema>;
