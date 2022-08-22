import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const LoginAPI = async (email, password) => {
  try {
    const url = "https://dev.imateam.us:8443/auth/login/";
    const body = {
      email: email,
      password: password,
    };
    const response = await axios.post(url, body);
    console.log("login responsse", response.data);
    if (response.data.token) {
      console.log(response.data.token);
      storeData(response.data.token);
      return response.data;
    }
  } catch (error) {
    console.log("login error", error.response.data);
    return error.response;
  }
};
const storeData = async (token) => {
  try {
    console.log("store data function called");
    const jsonValue = JSON.stringify(token);
    await AsyncStorage.setItem("auth", jsonValue);
  } catch (e) {
    console.error(e);
    console.log("insertion in async failed");
  }
  console.log("inserted in async");
};
export default LoginAPI;
