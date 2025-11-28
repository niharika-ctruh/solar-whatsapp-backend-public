import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { connectToDatabase } from "./src/shared/db/connect"
import auth from "./src/modules/auth";
import requests from "./src/modules/requests";

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());


// routes
app.use("/auth", auth.authRouter);
app.use("/request", requests.sendRequestRouter);


connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
