export type AppEnvironment = "development" | "staging" | "production";

const environmentVars = {
  EXPERIMENTS_SERVER_URL: process.env.NEXT_PUBLIC_ASSISTANTS_SERVER_URL,
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as AppEnvironment,
};
export default environmentVars;
