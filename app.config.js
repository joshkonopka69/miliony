// App configuration for Expo
export default {
  expo: {
    name: "SportMap",
    slug: "sportmap",
    version: "1.0.0",
    owner: "hubertdomagala",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sportmap.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.sportmap.app"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    jsEngine: "jsc", // Temporarily disable Hermes to fix polyfill conflicts
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
          defaultChannel: "default"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow SportMap to use your location to find nearby sports venues and events."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "372e8a03-e24f-4695-9ec5-f86f6408a7fa"
      }
    }
  }
};
