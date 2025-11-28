import { Request } from "express";
import { IUserType } from "../../modules/auth/types/user";

declare global {
    namespace Express {
        interface Request {
            user?: IUserType;
        }
    }
}

export interface AuthRequest extends Request {
    user?: IUserType;
}