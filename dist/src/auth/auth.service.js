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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const library_1 = require("@prisma/client/runtime/library");
const argon = require("argon2");
const confirmation_service_1 = require("../confirmation/confirmation.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, conf, confirmationService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.conf = conf;
        this.confirmationService = confirmationService;
    }
    async signup(dto) {
        try {
            const hash = await argon.hash(dto.password);
            const newUser = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    hash,
                },
            });
            this.confirmationService.sendConfirmationEmail(newUser.email);
            const token = await this.getJwtToken(newUser.id, newUser.username, newUser.email);
            const obj = {
                token,
                message: 'check your email to confirm your account',
            };
            return obj;
        }
        catch (error) {
            console.log(error);
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2002')
                    throw new common_1.HttpException('duplicate unique data', common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async confirm_register(token) {
        const email = await this.confirmationService.confirmEmail(token);
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user.IsEmailConfirmed) {
            throw new common_1.ForbiddenException('email already confirmed');
        }
        await this.prisma.user.update({
            where: { email },
            data: { IsEmailConfirmed: true },
        });
        const jwt = await this.getJwtToken(user.id, user.username, user.email);
        return jwt;
    }
    async resend_email(usery) {
        const user = await this.prisma.user.findUnique({ where: { id: usery.id } });
        if (user.IsEmailConfirmed) {
            throw new common_1.ForbiddenException('email already confirmed');
        }
        this.confirmationService.sendConfirmationEmail(user.email);
    }
    async signin(dto) {
        const where = 'email' in dto
            ? {
                email: dto.email,
            }
            : { username: dto.username };
        const user = await this.prisma.user.findUnique({
            where,
        });
        console.log(user);
        if (!user) {
            throw new common_1.HttpException('user not found', common_1.HttpStatus.NOT_FOUND);
        }
        const cmp = await argon.verify(user.hash, dto.password);
        if (!cmp) {
            throw new common_1.HttpException('wrong password', common_1.HttpStatus.FORBIDDEN);
        }
        const token = await this.getJwtToken(user.id, user.username, user.email);
        return token;
    }
    getJwtToken(id, username, email) {
        const payload = {
            sub: id,
            username,
            email,
        };
        return this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.conf.get('ACCESS_TOKEN_JWT_SECRET'),
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        confirmation_service_1.ConfirmationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map