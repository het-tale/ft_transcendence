"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
require("../css/landing.css");
const NavbarAuth_1 = require("../components/NavbarAuth");
const Main_1 = require("../components/Main");
function Landing() {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(NavbarAuth_1.default, null),
        react_1.default.createElement(Main_1.default, null)));
}
exports.default = Landing;
//# sourceMappingURL=Landing.js.map