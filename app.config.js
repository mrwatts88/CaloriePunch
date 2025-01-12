const VERSION = '1.1.0';
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const OWNER = 'mrwatts888';
const BASE_BUNDLE_IDENTIFIER = `com.${OWNER}.CaloriePunch`;
const BASE_APP_NAME = 'CaloriePunch';
const PROJECT_ID = 'e7e92c79-6b15-4dfd-af14-3a1ea7cdaa7d';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return `${BASE_BUNDLE_IDENTIFIER}.dev`;
  }

  if (IS_PREVIEW) {
    return `${BASE_BUNDLE_IDENTIFIER}.preview`;
  }

  return BASE_BUNDLE_IDENTIFIER;
};

const getAppName = () => {
  if (IS_DEV) {
    return `${BASE_APP_NAME} (Dev)`;
  }

  if (IS_PREVIEW) {
    return `${BASE_APP_NAME} (Preview)`;
  }

  return BASE_APP_NAME;
};

export default {
  expo: {
    name: getAppName(),
    slug: BASE_APP_NAME,
    version: VERSION,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: BASE_APP_NAME.toLowerCase(),
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      package: getUniqueIdentifier(),
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        }
      ]
    ],
    experiments: { typedRoutes: true },
    extra: {
      router: { origin: false },
      eas: { projectId: PROJECT_ID }
    },
    owner: OWNER,
    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`
    },
    runtimeVersion: { policy: 'appVersion' }
  }
}
