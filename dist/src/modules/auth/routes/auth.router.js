"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_controller_1 = require("../controller/auth.controller");
const authRouter = express_1.default.Router();
authRouter.post("/login", auth_middleware_1.loginValidation, auth_controller_1.handleLogin);
authRouter.post("/signup", auth_middleware_1.signupValidation, auth_controller_1.handelRegister);
authRouter.post("/request-password-reset", auth_middleware_1.requestPasswordValidation, auth_controller_1.handleRequestPasswordReset);
authRouter.post("/reset-password", auth_middleware_1.resetPasswordValidation, auth_controller_1.handleResetPassword);
exports.default = authRouter;
//# sourceMappingURL=auth.router.js.map