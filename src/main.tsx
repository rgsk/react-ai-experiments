import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-grid-layout/css/styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-resizable/css/styles.css";
import { RouterProvider } from "react-router-dom";
import "./globalModifications.ts";

import "./index.css";
import router from "./router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
