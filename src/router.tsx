import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "~/App";
import Providers from "~/Providers";
import HomePage from "./components/HomePage/HomePage";
import PracticePage from "./components/PracticePage/PracticePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <Providers>
          <App />
        </Providers>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="practice" element={<PracticePage />} />
    </Route>
  )
);
export default router;
