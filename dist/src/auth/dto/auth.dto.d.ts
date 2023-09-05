import { z } from 'nestjs-zod/z';
export declare const AuthsignUpSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodPassword;
}, "strip", z.ZodTypeAny, {
    username?: string;
    email?: string;
    password?: string;
}, {
    username?: string;
    email?: string;
    password?: string;
}>;
export declare const AuthSignInSchema: z.ZodEffects<z.ZodObject<{
    password: z.ZodPassword;
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password?: string;
    username?: string;
    email?: string;
}, {
    password?: string;
    username?: string;
    email?: string;
}>, {
    password?: string;
    username?: string;
    email?: string;
}, {
    password?: string;
    username?: string;
    email?: string;
}>;
declare const AuthSignUpDto_base: import("nestjs-zod").ZodDto<{
    username?: string;
    email?: string;
    password?: string;
}, z.ZodObjectDef<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodPassword;
}, "strip", z.ZodTypeAny>, {
    username?: string;
    email?: string;
    password?: string;
}>;
export declare class AuthSignUpDto extends AuthSignUpDto_base {
}
declare const AuthSignInDto_base: import("nestjs-zod").ZodDto<{
    password?: string;
    username?: string;
    email?: string;
}, z.ZodEffectsDef<z.ZodObject<{
    password: z.ZodPassword;
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password?: string;
    username?: string;
    email?: string;
}, {
    password?: string;
    username?: string;
    email?: string;
}>>, {
    password?: string;
    username?: string;
    email?: string;
}>;
export declare class AuthSignInDto extends AuthSignInDto_base {
}
export type TSigninData = z.infer<typeof AuthSignInSchema>;
export type TSignupData = z.infer<typeof AuthsignUpSchema>;
export {};
