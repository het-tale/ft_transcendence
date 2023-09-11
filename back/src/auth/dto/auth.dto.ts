import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const customEmailValidator = z.string().refine(
  (value) => {
    // Use a regular expression or any custom logic to validate the email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isStandardEmail = emailRegex.test(value);

    // You can also add custom logic to check for specific domains, like "@student.1337.ma"
    const isCustomEmail = value.endsWith('@student.1337.ma');

    return isStandardEmail || isCustomEmail;
  },
  {
    message: 'Invalid email address format',
  },
);

// const z.passwor().min  = z.string().refine(
//   (value) => {
//     const passwordRegex =
//       /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/;
//     const isStandardPassword = passwordRegex.test(value);

//     return isStandardPassword;
//   },
//   {
//     message:
//       'Password must contain at least 8 characters,one special character, 2 uppercase letters, 2 numbers, 3 lowercase letters',
//   },
// );

export const AuthsignUpSchema = z.object({
  username: z.string().trim().min(1, { message: 'Required' }),
  email: customEmailValidator,
  password: z.password().min(8, { message: 'Required' }),
});

export const AuthSignInSchema = z.object({
  password: z.password().min(8, { message: 'Required' }),
  identifier: z.string().trim().min(1, { message: 'Required' }),
});

export const SetPasswordSchema = z
  .object({
    password: z.password().min(8, { message: 'Required' }),
    confirmPassword: z.password().min(8, { message: 'Required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export const TwofaCodeSchema = z.object({
  code: z.string().trim().min(1, { message: 'Required' }),
});

export const ForgetPasswordSchema = z.object({
  email: z.string().trim().min(1, { message: 'Required' }),
});

export class AuthSignUpDto extends createZodDto(AuthsignUpSchema) {}
export class AuthSignInDto extends createZodDto(AuthSignInSchema) {}
export class SetPasswordDto extends createZodDto(SetPasswordSchema) {}
export class TwofaCodeDto extends createZodDto(TwofaCodeSchema) {}
export class ForgetPassworddto extends createZodDto(ForgetPasswordSchema) {}

// cloudinary-response.ts
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

export type TSigninData = z.infer<typeof AuthSignInSchema>;
export type TSignupData = z.infer<typeof AuthsignUpSchema>;
export type TSetPasswordData = z.infer<typeof SetPasswordSchema>;
export type TtwofaCodeData = z.infer<typeof TwofaCodeSchema>;
export type TforgetPasswordData = z.infer<typeof ForgetPasswordSchema>;
