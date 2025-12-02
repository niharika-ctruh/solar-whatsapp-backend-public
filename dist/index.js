"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const connect_1 = require("./shared/db/connect");
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./modules/auth"));
const requests_1 = __importDefault(require("./modules/requests"));
const app = (0, express_1.default)();
const port = env_1.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// routes
app.use("/auth", auth_1.default.authRouter);
app.use("/request", requests_1.default.sendRequestRouter);
(0, connect_1.connectToDatabase)().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
