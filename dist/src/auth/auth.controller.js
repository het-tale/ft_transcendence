"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_zod_1 = require("nestjs-zod");
const dto_1 = require("./dto");
const auth_service_1 = require("./auth.service");
const email_confirmation_guard_1 = require("./guards/email-confirmation.guard");
const jwt_authentication_guard_1 = require("./guards/jwt-authentication.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    signup(request, dto) {
        return this.authService.signup(dto);
    }
    confirm(token) {
        return this.authService.confirm_register(token);
    }
    resend(request) {
        return this.authService.resend_email(request.user);
    }
    signin(response, dto) {
        return this.authService.signin(dto);
    }
    me(request) {
        return request.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, nestjs_zod_1.UseZodGuard)('body', dto_1.AuthSignUpDto),
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Get)('confirm-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "confirm", null);
__decorate([
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    (0, common_1.Get)('resend-email'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resend", null);
__decorate([
    (0, nestjs_zod_1.UseZodGuard)('body', dto_1.AuthSignInDto),
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.UseGuards)(email_confirmation_guard_1.EmailConfirmationGuard),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map