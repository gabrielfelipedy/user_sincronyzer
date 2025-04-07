import * as dotenv from "dotenv";
import { login } from "./src/controllers/AuthController.js";
dotenv.config();
const clock = {
    ip: "172.18.5.241",
    user: "admin",
    password: "admin"
};
const session = await login(clock);
console.log(session);
