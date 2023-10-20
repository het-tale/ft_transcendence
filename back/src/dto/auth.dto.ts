import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const customEmailValidator = z.string().refine(
  (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isStandardEmail = emailRegex.test(value);

    const isCustomEmail = value.endsWith('@student.1337.ma');

    return isStandardEmail || isCustomEmail;
  },
  {
    message: 'Invalid email address format',
  },
);

export const customPasswordValidator = z.string().refine(
  (value) => {
    const passwordRegex =
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

    return passwordRegex.test(value);
  },
  {
    message:
      'Password must contain at least 8 characters, 3 lowercase, 2 uppercase, 2 digits and 1 special character',
  },
);

export const customUsernameValidator = z.string().refine(
  (value) => {
    const usernameRegex = /^[a-zA-Z0-9._-]{3,15}$/;

    return usernameRegex.test(value);
  },
  {
    message:
      'Username must contain at least 3 characters and no special characters except . _ - max 15 characters',
  },
);

export const AuthsignUpSchema = z.object({
  username: customUsernameValidator.describe('Username'),
  email: customEmailValidator.describe('Email'),
  password: customPasswordValidator.describe('Password'),
});

export const AuthSignInSchema = z.object({
  password: z.password().min(1, { message: 'Required' }).describe('Password'),
  identifier: z
    .string()
    .trim()
    .min(1, { message: 'Required' })
    .describe('Username or email'),
});

export const SetPasswordSchema = z
  .object({
    password: customPasswordValidator.describe('Password'),
    confirmPassword: customPasswordValidator.describe('Matching password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export const Add42CredentialsSchema = z
  .object({
    password: customPasswordValidator.describe('Password'),
    confirmPassword: customPasswordValidator.describe('Matching password'),
    username: customUsernameValidator.describe('Username'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export const TwofaCodeSchema = z.object({
  code: z.string().trim().min(1, { message: 'Required' }).describe('2fa Code'),
});

export const ForgetPasswordSchema = z.object({
  email: z.string().trim().min(1, { message: 'Required' }).describe('Email'),
});

export class AuthSignUpDto extends createZodDto(AuthsignUpSchema) {}
export class AuthSignInDto extends createZodDto(AuthSignInSchema) {}
export class SetPasswordDto extends createZodDto(SetPasswordSchema) {}
export class Add42CredentialsDto extends createZodDto(Add42CredentialsSchema) {}
export class TwofaCodeDto extends createZodDto(TwofaCodeSchema) {}
export class ForgetPassworddto extends createZodDto(ForgetPasswordSchema) {}

export type TSigninData = z.infer<typeof AuthSignInSchema>;
export type TSignupData = z.infer<typeof AuthsignUpSchema>;
export type TSetPasswordData = z.infer<typeof SetPasswordSchema>;
export type TtwofaCodeData = z.infer<typeof TwofaCodeSchema>;
export type TforgetPasswordData = z.infer<typeof ForgetPasswordSchema>;
export type TAdd42CredentialsData = z.infer<typeof Add42CredentialsSchema>;
