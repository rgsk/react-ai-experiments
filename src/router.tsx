import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "~/App";
import Providers from "~/Providers";
import ChatPage from "./components/ChatPage/ChatPage";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/LoginPage/LoginPage";
import PracticePage from "./components/PracticePage/PracticePage";
import PreviewPage from "./components/PreviewPage/PreviewPage";

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
      <Route path="login" element={<LoginPage />} />
      <Route path="preview-page" element={<PreviewPage />} />
      <Route path="chat">
        <Route path=":id" element={<ChatPage />} />
      </Route>
    </Route>
  )
);
export default router;
