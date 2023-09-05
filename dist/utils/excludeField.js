"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exclude = void 0;
function exclude(user, field) {
    const res = Object.entries(user)
        .map(([key, val]) => key !== field
        ? {
            [key]: val,
        }
        : undefined)
        .filter((field) => field !== undefined);
    return Object.assign({}, ...res);
}
exports.exclude = exclude;
//# sourceMappingURL=excludeField.js.map