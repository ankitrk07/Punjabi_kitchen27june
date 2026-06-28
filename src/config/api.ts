import Constants from "expo-constants";

// Auto-detect local development server IP so that physical devices can connect out-of-the-box
const getBaseUrl = () => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:3000/api`;
    }
    return "http://localhost:3000/api";
  }
  // Production fallback API URL
  return "https://punjabi-kitchen-api.example.com/api";
};

export const API_BASE_URL = getBaseUrl();
