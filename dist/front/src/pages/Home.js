"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../css/landing.css");
require("../css/sidebar.css");
const react_1 = require("react");
const Sidebar_1 = require("../components/Sidebar");
const NavbarSearch_1 = require("../components/NavbarSearch");
function Home() {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(NavbarSearch_1.default, null),
        react_1.default.createElement(Sidebar_1.default, null)));
}
exports.default = Home;
//# sourceMappingURL=Home.js.map