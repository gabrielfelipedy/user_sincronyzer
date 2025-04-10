import * as dotenv from "dotenv";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import * as util from 'util';
import { parseCsv, parseDuplicatedData } from "./src/utils/Parsers.js";
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
const raw_csvs = [];
await Promise.all(clocks.map(async (clock) => {
    const session = await login(clock);
    if (session) {
        const last_nsr = last_nsrs.find((last_nsr) => last_nsr.clock_id === clock.id);
        const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 1);
        const raw_csv = await getUsers(clock, session);
        raw_csvs.push({
            "clock_id": clock.id,
            "csv": raw_csv
        });
        console.log(parseCsv(raw_csv));
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
//console.log(raw_csvs)
// console.log("Dados processados:")
const parsedDuplicated = parseDuplicatedData(afds);
console.log(util.inspect(parsedDuplicated, { showHidden: false, depth: null, colors: true }));
