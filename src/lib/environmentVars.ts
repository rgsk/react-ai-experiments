export type AppEnvironment = "development" | "staging" | "production";

const environmentVars = {
  NODE_EXPERIMENTS_SERVER_URL: import.meta.env.VITE_NODE_EXPERIMENTS_SERVER_URL,
  PYTHON_EXPERIMENTS_SERVER_URL: import.meta.env
    .VITE_PYTHON_EXPERIMENTS_SERVER_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV as AppEnvironment,
};
export default environmentVars;
