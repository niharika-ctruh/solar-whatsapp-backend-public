"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResetPassword = exports.handleRequestPasswordReset = exports.handleLogin = exports.handelRegister = void 0;
const auth_service_1 = require("../services/auth.service");
const utils_1 = require("../../../shared/utils/utils");
const handelRegister = async (req, res) => {
    try {
        const { body } = req;
        const user = await (0, auth_service_1.createUser)(body);
        res.status(201).json({
            message: "User created successfully",
            _id: user._id,
            token: user.token,
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
};
exports.handelRegister = handelRegister;
const handleLogin = async (req, res) => {
    try {
        const { body } = req;
        const user = await (0, auth_service_1.login)(body);
        res.status(200).json({
            message: "Login successfully",
            _id: user._id,
            token: user.token,
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleLogin = handleLogin;
const handleRequestPasswordReset = async (req, res) => {
    try {
        const { body } = req;
        await (0, auth_service_1.requestPasswordReset)(body === null || body === void 0 ? void 0 : body.email);
        res.status(200).json({
            message: "Password reset link sent",
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleRequestPasswordReset = handleRequestPasswordReset;
const handleResetPassword = async (req, res) => {
    try {
        const { body, query } = req;
        await (0, auth_service_1.resetPassword)(body === null || body === void 0 ? void 0 : body.password, query.data);
        res.status(200).json({
            message: "Password has been reset",
        });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleResetPassword = handleResetPassword;
