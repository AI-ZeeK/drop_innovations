import { Platform } from "react-native";
import Constants from "expo-constants";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5001";
    } else if (Platform.OS === "ios") {
      return "http://localhost:5001";
    } else {
      return "http://[::1]:5001";
    }
  }
  return ""; // Production URL
};

const environment: { [key: string]: { API_BASE_URL: string } } = {
  production: {
    API_BASE_URL: "",
  },
  development: {
    API_BASE_URL: getBaseUrl(),
  },
};

const currentEnvironment = process.env.NODE_ENV || "development";

export default environment[currentEnvironment];
