import Constants from "expo-constants";

const getBaseUrl = () => {
  // Use the live hosted Render backend directly so images load reliably on any device
  return "https://punjabi-kitchen27june.onrender.com/api";
};

export const API_BASE_URL = getBaseUrl();
console.log("Resolved API_BASE_URL is:", API_BASE_URL);
