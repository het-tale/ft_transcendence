"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Switch_1 = require("@mui/material/Switch");
const FormControlLabel_1 = require("@mui/material/FormControlLabel");
function ButtonUsage() {
    return (React.createElement("div", null,
        React.createElement(Switch_1.default, { ...FormControlLabel_1.default, color: 'primary', defaultChecked: true }),
        React.createElement(Switch_1.default, { ...FormControlLabel_1.default, defaultChecked: true, color: "secondary" }),
        React.createElement(Switch_1.default, { ...FormControlLabel_1.default, defaultChecked: true, color: "warning" }),
        React.createElement(Switch_1.default, { ...FormControlLabel_1.default, defaultChecked: true, color: "default" })));
}
exports.default = ButtonUsage;
//# sourceMappingURL=ButtonUsage.js.map