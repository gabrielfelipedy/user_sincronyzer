import axios from "axios";
import { Clock } from "../models/interfaces/Clock.js";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.insecureHTTPParser = true;

export const login = async (clock: Clock | undefined) => {
  if(!clock) return null

  //console.log('CLOCK IP GOT: ', clock.ip)

  try {
    const response = await axios.post(`https://${clock.ip}/login.fcgi`, {
      login: clock.user,
      password: clock.password,
    });

    return response.data.session;

  } catch (error) {
    console.error(error);
  }
}

export const logout = async (clock: Clock | undefined, session: string | undefined) => {
  if(!clock || !session) return null

  //console.log('CLOCK IP GOT: ', clock.ip)

  try {
    const response = await axios.post(`https://${clock.ip}/logout.fcgi?session=${session}`);

    return response.data;

  } catch (error) {
    console.error(error);
  }
}