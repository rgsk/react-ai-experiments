import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "~/App";
import Providers from "~/Providers";
import ChatPage from "./components/ChatPage/ChatPage";
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
      <Route path="chat">
        <Route path=":id" element={<ChatPage />} />
      </Route>{" "}
    </Route>
  )
);
export default router;
