import "katex/dist/katex.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { RouterProvider } from "react-router-dom";
import "./globalModifications.ts";

import { addStyles } from "react-mathquill";
import "./global.css";
import router from "./router.tsx";

addStyles();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
