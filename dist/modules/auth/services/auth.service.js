"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.login = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../../config/env");
const helper_error_1 = require("../../../shared/helper/helper.error");
const helper_email_1 = require("../../../shared/helper/helper.email");
const utils_1 = require("../../../shared/utils/utils");
const helper_emailTemplates_1 = require("../../../shared/helper/helper.emailTemplates");
const createUser = async (body) => {
    try {
        const { firstName, lastName, email, password, role } = body;
        const user = await user_model_1.default.findOne({ email });
        if (user) {
            throw new helper_error_1.Errors("User already exists", 400);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new user_model_1.default({
            firstName,
            lastName,
            email,
            role,
            password: hashedPassword,
        });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser === null || newUser === void 0 ? void 0 : newUser._id, email: newUser === null || newUser === void 0 ? void 0 : newUser.email, token: newUser === null || newUser === void 0 ? void 0 : newUser.role }, env_1.JWT_SECRET, { expiresIn: "6h" });
        return {
            _id: newUser === null || newUser === void 0 ? void 0 : newUser._id,
            token,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.createUser = createUser;
const login = async (body) => {
    try {
        const { email, password } = body;
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            throw new helper_error_1.Errors("User does not exist, please sign up", 404);
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordCorrect)
            throw new helper_error_1.Errors("Password is incorrect", 401);
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, env_1.JWT_SECRET, { expiresIn: "6h" });
        return {
            _id: user._id,
            token,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.login = login;
const requestPasswordReset = async (email) => {
    try {
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            throw new helper_error_1.Errors("User does not exist, please sign up", 404);
        const secret = env_1.JWT_SECRET + user.password;
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, secret, {
            expiresIn: `${parseInt(process.env.OTP_VALIDITY_IN_MINS || "30", 10)}m`,
        });
        const payload = JSON.stringify({
            id: user._id,
            token,
        });
        const encryptedPayload = (0, utils_1.encrypt)(payload, env_1.ENCRYPTION_KEY);
        const resetURL = `${env_1.BASE_URL}?data=${encodeURIComponent(encryptedPayload)}`;
        const mailOptions = {
            to: user.email,
            from: env_1.MAIL_FROM,
            subject: "Password Reset Request",
            html: (0, helper_emailTemplates_1.requestPasswordTemplate)(resetURL),
        };
        const transporter = (0, helper_email_1.getMailerObject)();
        return await transporter.sendMail(mailOptions);
    }
    catch (error) {
        throw error;
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (password, data) => {
    try {
        const decryptedJSON = (0, utils_1.decrypt)(data, env_1.ENCRYPTION_KEY);
        const { id, token } = JSON.parse(decryptedJSON);
        const user = await user_model_1.default.findOne({ _id: id });
        if (!user)
            throw new helper_error_1.Errors("User does not exist, please sign up", 404);
        const secret = env_1.JWT_SECRET + user.password;
        const verify = jsonwebtoken_1.default.verify(token, secret);
        if (!verify || typeof verify !== "object" || !("id" in verify)) {
            throw new Error("Invalid token payload");
        }
        const encryptedPassword = await bcrypt_1.default.hash(password, 10);
        await user_model_1.default.updateOne({
            _id: id,
        }, {
            $set: {
                password: encryptedPassword,
            },
        });
        await user.save();
    }
    catch (error) {
        throw error;
    }
};
exports.resetPassword = resetPassword;
