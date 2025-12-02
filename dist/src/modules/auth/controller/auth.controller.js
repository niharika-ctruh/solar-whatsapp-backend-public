"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResetPassword = exports.handleRequestPasswordReset = exports.handleLogin = exports.handelRegister = void 0;
const auth_service_1 = require("../services/auth.service");
const utils_1 = require("../../../shared/utils/utils");
const handelRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const user = yield (0, auth_service_1.createUser)(body);
        res.status(201).json({
            message: "User created successfully",
            _id: user._id,
            token: user.token,
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
});
exports.handelRegister = handelRegister;
const handleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const user = yield (0, auth_service_1.login)(body);
        res.status(200).json({
            message: "Login successfully",
            _id: user._id,
            token: user.token,
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleLogin = handleLogin;
const handleRequestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        yield (0, auth_service_1.requestPasswordReset)(body === null || body === void 0 ? void 0 : body.email);
        res.status(200).json({
            message: "Password reset link sent",
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleRequestPasswordReset = handleRequestPasswordReset;
const handleResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body, query } = req;
        yield (0, auth_service_1.resetPassword)(body === null || body === void 0 ? void 0 : body.password, query.data);
        res.status(200).json({
            message: "Password has been reset",
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleResetPassword = handleResetPassword;
//# sourceMappingURL=auth.controller.js.map