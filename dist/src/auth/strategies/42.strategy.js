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
exports.Strategy42 = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
let Strategy42 = class Strategy42 extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor() {
        super({
            clientID: process.env.APP_ID,
            clientSecret: process.env.APP_SECRET,
            callbackURL: 'http://127.0.0.1:3000/auth/42/callback',
            scope: 'email',
            profileFields: ['email', 'login'],
        });
    }
    async validate(accessToken, refreshToken, profile) {
        const { login, email } = profile;
        const user = {
            email,
            login,
        };
        return user;
    }
};
exports.Strategy42 = Strategy42;
exports.Strategy42 = Strategy42 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Strategy42);
//# sourceMappingURL=42.strategy.js.map