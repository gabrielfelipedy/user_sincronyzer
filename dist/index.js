import * as dotenv from "dotenv";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { parseCSV } from "./src/utils/Parsers.js";
import { mergeClockData } from "./src/utils/Merger.js";
import { WriteClockUsers } from "./src/controllers/ClockController.js";
dotenv.config();
const clocks = [
    {
        ip: "172.18.5.241",
        user: "admin",
        password: "admin",
    },
    {
        ip: "172.18.5.240",
        user: "admin",
        password: "admin",
    },
];
const clocks_data = [];
const parsed_data = await Promise.all(clocks.map(async (clock) => {
    const session = await login(clock);
    if (session) {
        const users_string = await getUsers(clock, session);
        await logout(clock, session);
        return parseCSV(users_string);
    }
    else {
        console.log("Failed login");
        return [];
    }
}));
// Flatten and push all users
parsed_data.forEach((users) => {
    clocks_data.push(users);
});
const mergedData = mergeClockData(clocks_data);
for (const clock of clocks) {
    const session = await login(clock);
    if (session) {
        await await WriteClockUsers(mergedData, clock, session);
        await logout(clock, session);
    }
}
