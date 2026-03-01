/// <reference types="vite/client" />

/**
 * Describes the environment variables provided by Vite.
 * This ensures type safety when accessing environment variables.
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
 */
interface ImportMetaEnv {
  /** The base URL for the API endpoints. */
  readonly VITE_API_BASE_URL: string;

  // Add other environment variables here, for example:
  // readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Extends the global Window interface with custom properties.
 * This is useful for adding global functions or objects that are accessible
 * from anywhere in the application.
 *
 * Example:
 * interface Window {
 *   myApp: {
 *     someFunction: () => void;
 *   };
 * }
 */
