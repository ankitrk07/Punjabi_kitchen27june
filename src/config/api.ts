import Constants from "expo-constants";

const getBaseUrl = () => {
  // Prefer explicit API base URL from Expo constants extra configuration if available
  // This can be set in app.json or app.config.js under "extra": { "API_BASE_URL": "..." }
  const extraUrl = (Constants?.manifest?.extra?.API_BASE_URL) as string | undefined;
  if (extraUrl && extraUrl.trim().length > 0) {
    return extraUrl;
  }

  // Fallback to environment variable set at build time
  const envUrl = process.env.API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl;
  }

  // Default — use local dev server (LAN IP for physical device testing)
  // Change back to "https://punjabi-kitchen27june.onrender.com/api" for production
  return "http://10.173.194.177:3001/api";
};

export const API_BASE_URL = getBaseUrl();
console.log("Resolved API_BASE_URL is:", API_BASE_URL);
