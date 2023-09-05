"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSignInDto = exports.AuthSignUpDto = exports.AuthSignInSchema = exports.AuthsignUpSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const z_1 = require("nestjs-zod/z");
exports.AuthsignUpSchema = z_1.z.object({
    username: z_1.z.string(),
    email: z_1.z.string().email(),
    password: z_1.z.password(),
});
exports.AuthSignInSchema = z_1.z
    .object({
    password: z_1.z.password(),
    username: z_1.z.string().optional(),
    email: z_1.z.string().email().optional(),
})
    .refine((data) => data.username || data.email, {
    message: 'Either "username" or "email" must be provided',
});
class AuthSignUpDto extends (0, nestjs_zod_1.createZodDto)(exports.AuthsignUpSchema) {
}
exports.AuthSignUpDto = AuthSignUpDto;
class AuthSignInDto extends (0, nestjs_zod_1.createZodDto)(exports.AuthSignInSchema) {
}
exports.AuthSignInDto = AuthSignInDto;
//# sourceMappingURL=auth.dto.js.map