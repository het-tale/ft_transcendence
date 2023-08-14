import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const AuthsignUpSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.password(),
});

export const AuthSignInSchema = z
  .object({
    password: z.password(),
    username: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.username || data.email, {
    message: 'Either "username" or "email" must be provided',
  });

export class AuthSignUpDto extends createZodDto(AuthsignUpSchema) {}
export class AuthSignInDto extends createZodDto(AuthSignInSchema) {}

export type TSigninData = z.infer<typeof AuthSignInSchema>;
export type TSignupData = z.infer<typeof AuthsignUpSchema>;
