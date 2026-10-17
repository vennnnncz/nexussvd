import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Diisi saat build oleh scripts/build.mjs (esbuild define) dari .env / environment variables.
declare const __NEXUS_ENV__: Record<string, string>;
const env = __NEXUS_ENV__;

const config = {
  apiKey: (env.PUBLIC_FIREBASE_API_KEY as string | undefined) || undefined,
  authDomain: (env.PUBLIC_FIREBASE_AUTH_DOMAIN as string | undefined) || undefined,
  projectId: (env.PUBLIC_FIREBASE_PROJECT_ID as string | undefined) || undefined,
  appId: (env.PUBLIC_FIREBASE_APP_ID as string | undefined) || undefined,
  databaseURL:
    (env.PUBLIC_FIREBASE_DATABASE_URL as string | undefined) ||
    'https://kikircalc-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

export const useDemoData = env.PUBLIC_USE_DEMO_DATA === 'true';
/** Login admin hanya aktif bila config Firebase Auth diisi. */
export const authConfigured = Boolean(config.apiKey && config.authDomain);

const app = initializeApp(config);
export const db = getDatabase(app);
export const auth = authConfigured ? getAuth(app) : null;
