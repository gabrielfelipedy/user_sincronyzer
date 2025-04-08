import { User } from "../models/interfaces/User.js";
import { usersToCSV } from "../utils/Parsers.js";

import axios, { AxiosResponse, AxiosError } from 'axios';
import { Clock } from "../models/interfaces/Clock.js";


export const WriteClockUsers = async (users: User[] | undefined, clock: Clock, session: string) => {
    if(!users || !clock || !session) return ""

    const raw_csv = usersToCSV(users)

    try {
        
        const config = {
            headers: {
                'content-Type': 'application/octet-stream',
                'content-Length': new TextEncoder().encode(raw_csv).length 
            }
        };
    
        const response: AxiosResponse = await axios.post(`https:${clock.ip}/import_users_csv.fcgi?session=${session}&mode=671`, raw_csv, config);

        console.log("CSV uploaded sucessfully")
    
      } catch (error) {
        console.error(error);
      }
}