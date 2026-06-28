const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "expo-keep-awake": path.resolve(__dirname, "src/shims/expo-keep-awake"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Work around Expo dev-mode keep-awake activation crashes on some Android devices.
  // Only redirects the internal dev helper import; app functionality remains unchanged.
  if (moduleName === "expo-keep-awake") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "src/shims/expo-keep-awake/index.js"),
    };
  }

  if (typeof defaultResolveRequest === "function") {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
