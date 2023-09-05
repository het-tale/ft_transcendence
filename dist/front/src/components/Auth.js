"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Auth = () => {
    return (react_1.default.createElement("div", { className: "auth" },
        react_1.default.createElement(react_router_dom_1.Link, { to: "/login" }, "Sign In"),
        react_1.default.createElement(react_router_dom_1.Link, { to: "/register" }, "Sign Up")));
};
exports.default = Auth;
//# sourceMappingURL=Auth.js.map