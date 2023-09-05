"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_2 = require("@testing-library/react");
const App_1 = require("./App");
test('renders learn react link', () => {
    (0, react_2.render)(react_1.default.createElement(App_1.default, null));
    const linkElement = react_2.screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
//# sourceMappingURL=App.test.js.map