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

export const AuthsignUpSchema = z.object({
  username: z.string(),
  email: customEmailValidator,
  password: z.password(),
});

export const AuthSignInSchema = z.object({
  password: z.password(),
  identifier: z.string(),
});

export const SetPasswordSchema = z.object({
  password: z.password(),
});

export class AuthSignUpDto extends createZodDto(AuthsignUpSchema) {}
export class AuthSignInDto extends createZodDto(AuthSignInSchema) {}
export class SetPasswordDto extends createZodDto(SetPasswordSchema) {}

export type TSigninData = z.infer<typeof AuthSignInSchema>;
export type TSignupData = z.infer<typeof AuthsignUpSchema>;
export type TSetPasswordData = z.infer<typeof SetPasswordSchema>;
