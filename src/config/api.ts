import Constants from "expo-constants";

const getBaseUrl = () => {
  if (__DEV__) {
    // Connect to the local backend server running on port 3000 during development
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(":")[0];
      return `http://${ip}:3000/api`;
    }
    return "http://localhost:3000/api";
  }
  // Use the live hosted Render backend in production
  return "https://punjabi-kitchen27june.onrender.com/api";
};

export const API_BASE_URL = getBaseUrl();
console.log("Resolved API_BASE_URL is:", API_BASE_URL);
