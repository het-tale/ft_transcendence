"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Sidebar = () => {
    return (react_1.default.createElement("aside", null,
        react_1.default.createElement("a", { href: "" },
            react_1.default.createElement("i", { className: "fa fa-home fa-lg", "aria-hidden": "true" }),
            "Home"),
        react_1.default.createElement("a", { href: "" },
            react_1.default.createElement("i", { className: "fa fa-send fa-lg", "aria-hidden": "true" }),
            "Chat"),
        react_1.default.createElement("a", { href: "" },
            react_1.default.createElement("i", { className: "fa fa-gamepad fa-lg", "aria-hidden": "true" }),
            "Play"),
        react_1.default.createElement("a", { href: "" },
            react_1.default.createElement("i", { className: "fa fa-user-o fa-lg", "aria-hidden": "true" }),
            "Profile"),
        react_1.default.createElement("a", { href: "", id: "more" },
            react_1.default.createElement("i", { className: "fa fa-gear fa-lg", "aria-hidden": "true" }),
            "More")));
};
exports.default = Sidebar;
//# sourceMappingURL=Sidebar.js.map