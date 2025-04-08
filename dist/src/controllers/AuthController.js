import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.insecureHTTPParser = true;
export const login = async (clock) => {
    if (!clock)
        return null;
    console.log('CLOCK IP GOT: ', clock.ip);
    try {
        const response = await axios.post(`https://${clock.ip}/login.fcgi`, {
            login: clock.user,
            password: clock.password,
        });
        return response.data.session;
    }
    catch (error) {
        console.error(error);
    }
};
export const logout = async (clock, session) => {
    if (!clock)
        return null;
    console.log('CLOCK IP GOT: ', clock.ip);
    try {
        const response = await axios.post(`https://${clock.ip}/logout.fcgi?session=${session}`);
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
};
