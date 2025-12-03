import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { BASE_URL, ENCRYPTION_KEY, JWT_SECRET, MAIL_FROM } from "../../../config/env";
import { Errors } from "../../../shared/helper/helper.error";
import { getMailerObject } from "../../../shared/helper/helper.email";
import { encrypt, decrypt } from "../../../shared/utils/utils";
import { requestPasswordTemplate } from "../../../shared/helper/helper.emailTemplates";
import { IUserType } from "../types/user";

export const createUser = async (body: IUserType) => {
    try {
        const { firstName, lastName, email, password, role } = body;
        const user = await UserModel.findOne({ email });
        if (user) {
            throw new Errors("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            role,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser?._id, email: newUser?.email, token: newUser?.role }, JWT_SECRET as string, { expiresIn: "6h" });

        return {
            _id: newUser?._id,
            token,
        };
    } catch (error) {
        throw error;
    }
};

export const login = async (body: IUserType) => {
    try {
        const { email, password } = body;

        const user = await UserModel.findOne({ email });
        if (!user) throw new Errors("User does not exist, please sign up", 404);

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) throw new Errors("Password is incorrect", 401);

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET as string, { expiresIn: "6h" });

        return {
            _id: user._id,
            token,
        };
    } catch (error) {
        throw error;
    }
};

export const requestPasswordReset = async (email: string) => {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) throw new Errors("User does not exist, please sign up", 404);

        const secret = JWT_SECRET + user.password;
        const token = jwt.sign({ id: user._id, email: user.email }, secret, {
            expiresIn: `${parseInt(process.env.OTP_VALIDITY_IN_MINS || "30", 10)}m`,
        });

        const payload = JSON.stringify({
            id: user._id,
            token,
        });

        const encryptedPayload = encrypt(payload, ENCRYPTION_KEY!);

        const resetURL = `${BASE_URL}?data=${encodeURIComponent(encryptedPayload)}`;

        const mailOptions = {
            to: user.email,
            from: MAIL_FROM,
            subject: "Password Reset Request",
            html: requestPasswordTemplate(resetURL),
        };

        const transporter = getMailerObject();
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (password: string, data: string) => {
    try {
        const decryptedJSON = decrypt(data, ENCRYPTION_KEY!);
        if (!decryptedJSON) throw new Errors("Invalid or expired reset link", 400);

        const { id, token } = JSON.parse(decryptedJSON);

        const user = await UserModel.findOne({ _id: id });
        if (!user) throw new Errors("User does not exist, please sign up", 404);

        const secret = JWT_SECRET + user.password;

        let payload;
        try {
            payload = jwt.verify(token, secret) as { id: string; email: string };
        } catch (e) {
            throw new Errors("Invalid or expired reset token", 400);
        }

        if (payload.id !== user._id.toString()) throw new Errors("Invalid reset token payload", 400);

        const encryptedPassword = await bcrypt.hash(password, 10);

        user.password = encryptedPassword;
        await user.save();
    } catch (error) {
        throw error;
    }
};
