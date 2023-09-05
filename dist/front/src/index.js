"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const client_1 = require("react-dom/client");
require("./index.css");
const App_1 = require("./App");
const reportWebVitals_1 = require("./reportWebVitals");
const root = client_1.default.createRoot(document.getElementById('root'));
root.render(react_1.default.createElement(react_1.default.StrictMode, null,
    react_1.default.createElement(App_1.default, null)));
(0, reportWebVitals_1.default)();
//# sourceMappingURL=index.js.map