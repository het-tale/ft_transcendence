"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Home_1 = require("./pages/Home");
const Landing_1 = require("./pages/Landing");
const Login_1 = require("./pages/Login");
const Register_1 = require("./pages/Register");
const CompleteProfile_1 = require("./pages/CompleteProfile");
const react_1 = require("react");
function App() {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
            react_1.default.createElement(react_router_dom_1.Routes, null,
                react_1.default.createElement(react_router_dom_1.Route, { path: "/", element: react_1.default.createElement(Landing_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "home", element: react_1.default.createElement(Home_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "login", element: react_1.default.createElement(Login_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "register", element: react_1.default.createElement(Register_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "complete-profile", element: react_1.default.createElement(CompleteProfile_1.default, null) })))));
}
exports.default = App;
//# sourceMappingURL=App.js.map