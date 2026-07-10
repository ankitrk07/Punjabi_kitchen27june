import Constants from "expo-constants";

const getBaseUrl = () => {
  // Try to use debugger host IP for local testing on mobile devices
  const debuggerHost = Constants.expoConfig?.hostUri || "";
  const ip = debuggerHost.split(":")[0];
  if (ip) {
    return `http://${ip}:3000/api`;
  }
  return "https://punjabi-kitchen27june.onrender.com/api";
};

export const API_BASE_URL = getBaseUrl();
console.log("Resolved API_BASE_URL is:", API_BASE_URL);
