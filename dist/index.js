import * as dotenv from "dotenv";
import { login, logout } from "./src/controllers/AuthController.js";
import { parseDuplicatedData } from "./src/utils/Parsers.js";
import { getAfdByInitialNSR, getAllClocks, getLastNSR } from "./src/controllers/ClockController.js";
dotenv.config();
const clocks = await getAllClocks();
console.log(clocks);
const last_nsrs = await getLastNSR();
console.log(last_nsrs);
// const session = await login(clocks[0]);
// const afd = await getAfdByInitialNSR(session, clocks[0], last_nsrs[0].last_nsr)
//console.log(afd)
const afds = [];
const clocks_data = [];
const parsed_data = await Promise.all(clocks.map(async (clock) => {
    const session = await login(clock);
    if (session) {
        const last_nsr = last_nsrs.find((last_nsr) => last_nsr.clock_id === clock.id);
        const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 1);
        await logout(clock, session);
        const afd_object = {
            "clock_id": clock.id,
            "afd": afd
        };
        afds.push(afd_object);
    }
    else {
        console.log("Failed login");
        return [];
    }
}));
console.log(afds);
console.log("Dados processados:");
const parsedDuplicated = parseDuplicatedData(afds);
console.log(parsedDuplicated);
// const mergedData = mergeClockData(clocks_data);
// for(const clock of clocks)
// {
//     const session = await login(clock)
//     if(session)
//     {
//         await await WriteClockUsers(mergedData, clock, session);
//         await logout(clock, session);
//     }
// }
