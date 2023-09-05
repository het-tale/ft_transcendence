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
exports.ConfirmationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mailer_service_1 = require("../mailer/mailer.service");
let ConfirmationService = class ConfirmationService {
    constructor(jwt, mailer, conf) {
        this.jwt = jwt;
        this.mailer = mailer;
        this.conf = conf;
    }
    async sendConfirmationEmail(email) {
        try {
            const token = this.jwt.sign({ email }, {
                expiresIn: '15m',
                secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
            });
            console.log(token);
            const url = `${this.conf.get('FRONTEND_URL')}/confirm-email/?token=${token}`;
            const html = `<a href="${url}">Confirm your email</a>`;
            console.log(html);
            await this.mailer.sendMail({
                from: this.conf.get('EMAIL_USER'),
                to: email,
                subject: 'Confirm your email',
                html,
            });
        }
        catch (error) {
            console.log(error);
            throw new common_1.HttpException('Sending confirmation email failed', 500);
        }
    }
    async confirmEmail(token) {
        try {
            const payload = await this.jwt.verify(token, {
                secret: this.conf.get('EMAIL_VERIFICATION_JWT_SECRET'),
            });
            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new common_1.BadRequestException();
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new common_1.BadRequestException('Email confirmation token expired');
            }
            throw new common_1.BadRequestException('Bad confirmation token');
        }
    }
};
exports.ConfirmationService = ConfirmationService;
exports.ConfirmationService = ConfirmationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mailer_service_1.MailerService,
        config_1.ConfigService])
], ConfirmationService);
//# sourceMappingURL=confirmation.service.js.map