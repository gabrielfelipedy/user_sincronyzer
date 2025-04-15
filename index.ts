import { login, logout } from "./src/controllers/AuthController.js";
import { getUsers } from "./src/controllers/UserController.js";
import { Clock } from "./src/models/interfaces/Clock.js";
import { NSR } from "./src/models/interfaces/NSR.js";
import { AFD } from "./src/models/interfaces/AFD.js";
import * as util from 'util';
import { RawCSV } from "./src/models/interfaces/RawCSV.js";
import { getCpfFromCsvLine, parseCsv, parseDuplicatedData } from "./src/utils/Parsers.js";
import { getAfdByInitialNSR, getAllClocks, getLastNSR, RecordLastNSR, WriteClockUsers } from "./src/controllers/ClockController.js";
import { MergeUsers } from "./src/utils/Merger.js";

//GET ALL TIME CLOCKS
const clocks = await getAllClocks()
//console.log(clocks)

// GET ALL NSRS
const last_nsrs = await getLastNSR()
//console.log(last_nsrs)


const afds: AFD[] = []
const raw_csvs: RawCSV[] = []

const users_from_csv = new Map<number, string>()
let headers: string | undefined = ''

await Promise.all(

  clocks.map(async (clock: Clock) => {

    // login to clock
    const session = await login(clock);

    if (session) { //if valid sessiojn
      const last_nsr = last_nsrs.find(
        (last_nsr: NSR) => last_nsr.clock_id === clock.id
      );

      const afd = await getAfdByInitialNSR(session, clock, Number(last_nsr.last_nsr) + 2) //get afd by intial nsr

      //console.log(parseCsv(raw_csv))

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


const parsedDuplicated = parseDuplicatedData(afds)
//console.log(`length: ${Array.from(parsedDuplicated.values()).length}`)
console.log(parsedDuplicated)

await Promise.all(
  clocks.map(async (clock: Clock) => {

    // login to clock
    const session = await login(clock);

    if (session) { //if valid sessiojn
      
      const users_csv = await getUsers(clock, session) // export all users in csv format
      //console.log(users_csv)
      const parsedCSV = parseCsv(users_csv) // array of strings
      headers = parsedCSV.header

      for(const line of parsedCSV.lines)
      {
        const cpf = getCpfFromCsvLine(line)

        if(!cpf || !parsedDuplicated.has(cpf)) continue

        const existingEntry = users_from_csv.get(cpf)

        if(!existingEntry || parsedDuplicated.get(cpf)?.clock_id === clock.id)
        {
          users_from_csv.set(cpf, line)
        }
      }

      await logout(clock, session);

      
    } else {
      console.log("Failed login");
      return [];
    }
  })
)

//console.log(`length: ${Array.from(users_from_csv.values()).length}`)
const new_csv = `${headers}\r\n${MergeUsers(users_from_csv)}`

console.log(new_csv)

let sucess: string | boolean = false
await Promise.all(

  clocks.map(async (clock: Clock) => {

    // login to clock
    const session = await login(clock);

    if (session) { //if valid sessiojn
      
      sucess = await WriteClockUsers(new_csv, clock, session)
      await logout(clock, session)
      
    } else {
      console.log("Failed login");
      return [];
    }
  })
);

if(sucess) RecordLastNSR(parsedDuplicated)