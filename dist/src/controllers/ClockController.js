import { usersToCSV } from "../utils/Parsers.js";
import axios from 'axios';
export const WriteClockUsers = async (users, clock, session) => {
    if (!users || !clock || !session)
        return "";
    const raw_csv = usersToCSV(users);
    try {
        const config = {
            headers: {
                'content-Type': 'application/octet-stream',
                'content-Length': new TextEncoder().encode(raw_csv).length
            }
        };
        const response = await axios.post(`https:${clock.ip}/import_users_csv.fcgi?session=${session}&mode=671`, raw_csv, config);
        console.log("CSV uploaded sucessfully");
    }
    catch (error) {
        console.error(error);
    }
};
