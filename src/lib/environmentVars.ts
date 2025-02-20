export type AppEnvironment = "development" | "staging" | "production";

const environmentVars = {
  EXPERIMENTS_SERVER_URL: import.meta.env.VITE_ASSISTANTS_SERVER_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV as AppEnvironment,
};
export default environmentVars;
