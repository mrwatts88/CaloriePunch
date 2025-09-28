import Constants from 'expo-constants';

/**
 * Get environment variables from either local .env file or EAS build environment
 *
 * For local development:
 * - Variables are loaded from .env file via react-native-dotenv
 * - Import them directly from '@env'
 *
 * For EAS builds:
 * - Variables are set in eas.json build profiles under "env" key
 * - They get passed through app.config.js extra.env and are accessible via Constants.expoConfig.extra.env
 *
 * Usage:
 * import { getEnvVar } from '@/utils/env';
 * const apiUrl = getEnvVar('API_URL');
 */

export const getEnvVar = (key: string): string | undefined => {
  // In production builds, get from Constants (EAS build env)
  if (Constants.expoConfig?.extra?.env?.[key]) {
    return Constants.expoConfig.extra.env[key];
  }

  // In development, try to get from process.env (loaded from .env via dotenv in app.config.js)
  return process.env[key];
};

/**
 * Get environment variable with a fallback value
 */
export const getEnvVarWithFallback = (key: string, fallback: string): string => {
  return getEnvVar(key) ?? fallback;
};

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__ || getEnvVar('APP_VARIANT') === 'development';
};

/**
 * Check if we're running in preview mode
 */
export const isPreview = (): boolean => {
  return getEnvVar('APP_VARIANT') === 'preview';
};

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => {
  return !__DEV__ && getEnvVar('APP_VARIANT') !== 'development' && getEnvVar('APP_VARIANT') !== 'preview';
};