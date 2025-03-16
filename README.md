# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

```mermaid
graph TD;
A[Total Expenses: 9434] -->|Amount Given| B[8000];
B -->|Reimbursement| C[1434];
C -->|Amount belonging to Lal and Aksh| D[200]
C -->|Amount due to Rahul Gupta| E[1234]

    subgraph Expenses Breakdown
        F[Uber Trip - Noida to Bhiwadi: 2590]
        G[Tolls to Driver: 780]
        H[Pizza Breakfast: 291]
        I[Lunch in Expo: 400]
        J[Water Bottles: 40]
        K[Tea: 40]
        L[Auto Rikshaw Expo to Hotel: 100]
        M[Boiled Eggs: 60]
        N[Egg Rolls: 150]
        O[Hotel: 1211]
        P[Soap: 40]
        Q[Breakfast Sunday Morning: 251]
        R[Snacks: 130]
        S[Auto: 100]
        T[Lunch: 150]
        U[Water Bottle: 20]
        V[Tea: 40]
        W[Taxi to Noida: 3000]
        X[Ride to home: 41]
    end

    A --> Expenses Breakdown;
```
