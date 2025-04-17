import axios from "axios";
import { Clock } from "../models/interfaces/Clock.js";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.insecureHTTPParser = true;

export const getUsers = async (clock: Clock | undefined, session: string) => {
  if (!clock) return null;

  try {
    const response = await axios.post(
      `https://${clock.ip}/export_users_csv.fcgi?session=${session}&mode=671`
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};
