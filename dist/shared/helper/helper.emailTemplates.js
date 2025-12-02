"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordTemplate = void 0;
const requestPasswordTemplate = (resetURL) => {
    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                margin: 0;
            }
        </style>
    </head>
    <body style="height: 100dvh; width: 100%;">
        <table style="background: linear-gradient(270deg, #5070f9 0%, #5098f9 100%); height: 100%; width: 100%; padding: 64px 32px; text-align: center">
            <tr>
                <td>
                    <a href="https://www.ctruh.com/" target="_blank" style="text-decoration: none">
                        <img
                            src="https://ctruh-data.s3.ap-south-1.amazonaws.com/blog/df745af9-87b4-429a-b6f2-8a929086ba77.png"
                            style="height: 64px"
                        />
                    </a>
                </td>
            </tr>
            <tr>
                <td>
                    <table
                        style="
                            background: white;
                            padding: 32px;
                            border-radius: 4px;
                            box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
                            margin: 0 auto;
                            border-collapse: separate;
                            border-spacing: 0 12px;
                        "
                    >
                        <tr>
                            <td><h2 style="margin: 0; font-weight: 500">Reset Your Password</h2></td>
                        </tr>
                        <tr>
                            <td>
                                We received a request to reset your password for
                                <a href=${process.env.BASE_URL} target="_blank" style="font-weight: 500; text-decoration: none; color: #3d75f3"
                                    >Solar Host Project</a
                                >
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 0">
                                <a
                                    href="${resetURL}"
                                    target="_blank"
                                    style="
                                        background: linear-gradient(270deg, #5070f9 0%, #5098f9 100%);
                                        color: white;
                                        padding: 14px 32px;
                                        text-decoration: none;
                                        border-radius: 4px;
                                        font-weight: 500;
                                        display: inline-block;
                                        font-size: 16px;
                                    "
                                >
                                    Reset Password
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #25adf9; font-size: 14px">This link will expire in ${process.env.OTP_VALIDITY_IN_MINS} minutes</td>
                        </tr>
                        <tr>
                            <td style="font-size: 13px; color: #666; padding-top: 8px">
                                If you didn't request this password reset, please ignore this email.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
`;
};
exports.requestPasswordTemplate = requestPasswordTemplate;
