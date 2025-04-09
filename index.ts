import * as dotenv from "dotenv";
import iconv from "iconv-lite";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { parseCSV, parseDuplicatedData, usersToCSV } from "./src/utils/Parsers.js";
import { Clock } from "./src/models/interfaces/Clock.js";
import { User } from "./src/models/interfaces/User.js";
import { mergeClockData } from "./src/utils/Merger.js";
import { getAfdByInitialNSR, getAllClocks, getLastNSR, WriteClockUsers } from "./src/controllers/ClockController.js";
import { NSR } from "./src/models/interfaces/NSR.js";
import { AFD } from "./src/models/interfaces/AFD.js";

dotenv.config();

const clocks = await getAllClocks()
console.log(clocks)


const last_nsrs = await getLastNSR()
console.log(last_nsrs)

// const session = await login(clocks[0]);
// const afd = await getAfdByInitialNSR(session, clocks[0], last_nsrs[0].last_nsr)
//console.log(afd)

const afds: AFD[] = []
const clocks_data: User[][] = [];

const parsed_data = await Promise.all(
  clocks.map(async (clock: Clock) => {
    const session = await login(clock);

    if (session) {
      const last_nsr = last_nsrs.find(
        (last_nsr: NSR) => last_nsr.clock_id === clock.id
      );

      const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 1)
      await logout(clock, session);

      const afd_object = {
        "clock_id": clock.id,
        "afd": afd
      } as AFD

      afds.push(afd_object)
      
    } else {
      console.log("Failed login");
      return [];
    }
  })
);


console.log(afds)

console.log("Dados processados:")
const parsedDuplicated = parseDuplicatedData(afds)

console.log(parsedDuplicated)
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