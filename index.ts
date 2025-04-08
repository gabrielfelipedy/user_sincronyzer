import * as dotenv from "dotenv";
import iconv from "iconv-lite";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { parseCSV, usersToCSV } from "./src/utils/Parsers.js";
import { Clock } from "./src/models/interfaces/Clock.js";
import { User } from "./src/models/interfaces/User.js";
import { mergeClockData } from "./src/utils/Merger.js";
import { WriteClockUsers } from "./src/controllers/ClockController.js";

dotenv.config();

const clocks = [
  {
    ip: "172.18.5.241",
    user: "admin",
    password: "admin",
  } as Clock,
  {
    ip: "172.18.5.240",
    user: "admin",
    password: "admin",
  } as Clock,
];

const clocks_data: User[][] = [];

const parsed_data = await Promise.all(
  clocks.map(async (clock) => {
    const session = await login(clock);

    if (session) {
      const users_string = await getUsers(clock, session);
      await logout(clock, session);
      return parseCSV(users_string);
    } else {
      console.log("Failed login");
      return [];
    }
  })
);
// Flatten and push all users
parsed_data.forEach((users) => {
  clocks_data.push(users);
});

const mergedData = mergeClockData(clocks_data);

for(const clock of clocks)
{
    const session = await login(clock)

    if(session)
    {
        await await WriteClockUsers(mergedData, clock, session);
        await logout(clock, session);
    }
}