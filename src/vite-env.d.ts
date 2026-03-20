/// <reference types="vite/client" />

/** Amplify-friendly alias when `VITE_LOGIN_PASSWORD` is not passed to the build */
interface ImportMetaEnv {
  readonly VITE_LOGIN_PASS?: string;
  readonly VITE_AUTH_PASS?: string;
}
