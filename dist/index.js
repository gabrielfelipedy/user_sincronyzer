import * as dotenv from "dotenv";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { getCpfFromCsvLine, parseCsv, parseDuplicatedData } from "./src/utils/Parsers.js";
import { getAfdByInitialNSR, getAllClocks, getLastNSR } from "./src/controllers/ClockController.js";
dotenv.config();
//GET ALL TIME CLOCKS
const clocks = await getAllClocks();
//console.log(clocks)
// GET ALL NSRS
const last_nsrs = await getLastNSR();
//console.log(last_nsrs)
const afds = [];
const raw_csvs = [];
const users_from_csv = new Map();
await Promise.all(clocks.map(async (clock) => {
    // login to clock
    const session = await login(clock);
    if (session) { //if valid sessiojn
        const last_nsr = last_nsrs.find((last_nsr) => last_nsr.clock_id === clock.id);
        const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 1); //get afd by intial nsr
        //console.log(parseCsv(raw_csv))
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
const parsedDuplicated = parseDuplicatedData(afds);
console.log(`length: ${Array.from(parsedDuplicated.values()).length}`);
console.log(parsedDuplicated);
await Promise.all(clocks.map(async (clock) => {
    // login to clock
    const session = await login(clock);
    if (session) { //if valid sessiojn
        const users_csv = await getUsers(clock, session); // export all users in csv format
        //console.log(users_csv)
        const parsedCSV = parseCsv(users_csv); // array of strings
        for (const line of parsedCSV) {
            const cpf = getCpfFromCsvLine(line);
            if (!cpf)
                continue;
            const existingEntry = users_from_csv.get(cpf);
            if (!existingEntry || parsedDuplicated.get(cpf)?.clock_id === clock.id) {
                users_from_csv.set(cpf, line);
            }
        }
        // raw_csvs.push(
        //   {
        //     "clock_id": clock.id,
        //     "csv": parseCsv(users_csv)
        //   }
        // )
        //console.log(parseCsv(raw_csv))
        await logout(clock, session);
    }
    else {
        console.log("Failed login");
        return [];
    }
}));
console.log(`length: ${Array.from(users_from_csv.values()).length}`);
console.log(users_from_csv);
//console.log(afds)
// console.log(util.inspect(raw_csvs, { showHidden: false, depth: null, colors: true }));
// console.log("Dados processados:")
