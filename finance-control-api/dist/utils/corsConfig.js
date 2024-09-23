"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOrigin = void 0;
const setOrigin = () => {
    return process.env.NODE_ENV === "production"
        ? "https://equilibriofinanceiro.web.app"
        : "http://localhost:5173";
};
exports.setOrigin = setOrigin;
//# sourceMappingURL=corsConfig.js.map