import express from "express";
import { loginValidation, requestPasswordValidation, resetPasswordValidation, signupValidation } from "../middlewares/auth.middleware";
import { handelRegister, handleLogin, handleRequestPasswordReset, handleResetPassword } from "../controller/auth.controller";

const authRouter = express.Router();

authRouter.post("/login", loginValidation, handleLogin);
authRouter.post("/signup", signupValidation, handelRegister);
authRouter.post("/request-password-reset", requestPasswordValidation, handleRequestPasswordReset);
authRouter.post("/reset-password", resetPasswordValidation, handleResetPassword);

export default authRouter;
