"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationModule = void 0;
const common_1 = require("@nestjs/common");
const confirmation_service_1 = require("./confirmation.service");
const jwt_1 = require("@nestjs/jwt");
const mailer_module_1 = require("../mailer/mailer.module");
let ConfirmationModule = class ConfirmationModule {
};
exports.ConfirmationModule = ConfirmationModule;
exports.ConfirmationModule = ConfirmationModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), mailer_module_1.MailerModule],
        providers: [confirmation_service_1.ConfirmationService],
        exports: [confirmation_service_1.ConfirmationService],
    })
], ConfirmationModule);
//# sourceMappingURL=confirmation.module.js.map