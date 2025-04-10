import * as dotenv from "dotenv";
import iconv from "iconv-lite";
import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { Clock } from "./src/models/interfaces/Clock.js";
import { NSR } from "./src/models/interfaces/NSR.js";
import { AFD } from "./src/models/interfaces/AFD.js";
import * as util from 'util';
import { RawCSV } from "./src/models/interfaces/RawCSV.js";
import { parseCsv, parseDuplicatedData } from "./src/utils/Parsers.js";
import { getAfdByInitialNSR, getAllClocks, getLastNSR } from "./src/controllers/ClockController.js";

dotenv.config();

const clocks = await getAllClocks()
console.log(clocks)


const last_nsrs = await getLastNSR()
console.log(last_nsrs)

// const session = await login(clocks[0]);
// const afd = await getAfdByInitialNSR(session, clocks[0], last_nsrs[0].last_nsr)
//console.log(afd)

const afds: AFD[] = []

const raw_csvs: RawCSV[] = []

await Promise.all(
  clocks.map(async (clock: Clock) => {
    const session = await login(clock);

    if (session) {
      const last_nsr = last_nsrs.find(
        (last_nsr: NSR) => last_nsr.clock_id === clock.id
      );

      const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 1)
      const raw_csv = await getUsers(clock, session)
      raw_csvs.push(
        {
          "clock_id": clock.id,
          "csv": raw_csv
        }
      )

      console.log(parseCsv(raw_csv))

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
//console.log(raw_csvs)

// console.log("Dados processados:")
const parsedDuplicated = parseDuplicatedData(afds)
console.log(util.inspect(parsedDuplicated, { showHidden: false, depth: null, colors: true }));

