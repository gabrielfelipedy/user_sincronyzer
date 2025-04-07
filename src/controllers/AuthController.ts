import axios from "axios";
import { Clock } from "../models/Clock.js";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.insecureHTTPParser = true;

export const login = async (clock: Clock) => {
  try {
    const response = await axios.post(`https://${clock.ip}/login.fcgi`, {
      login: clock.user,
      password: clock.password,
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}