import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "~/App";
import Providers from "~/Providers";
import AdminHomePage from "./components/Admin/AdminHomePage/AdminHomePage";
import AdminSingleUserPage from "./components/Admin/AdminSingleUserPage/AdminSingleUserPage";
import AssistantsChatPage from "./components/AssistantsChatPage/AssistantsChatPage";
import ChatPage from "./components/ChatPage/ChatPage";
import EditPersonaPage from "./components/EditPersonaPage/EditPersonaPage";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/LoginPage/LoginPage";
import OcrPage from "./components/OcrPage/OcrPage";
import PersonasPage from "./components/PersonasPage/PersonasPage";
import PracticePage from "./components/PracticePage/PracticePage";
import PreviewPage from "./components/PreviewPage/PreviewPage";
import YoutubeTranscriptPage from "./components/YoutubeTranscriptPage/YoutubeTranscriptPage";

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
      <Route path="youtube">
        <Route path="transcript" element={<YoutubeTranscriptPage />} />
      </Route>
      <Route path="ocr">
        <Route index element={<OcrPage />} />
      </Route>
      <Route path="assistants">
        <Route path="chat" element={<AssistantsChatPage />} />
      </Route>
      <Route path="admin">
        <Route index element={<AdminHomePage />} />
        <Route path="users">
          <Route path=":userEmail" element={<AdminSingleUserPage />} />
        </Route>
      </Route>
      <Route path="personas">
        <Route index element={<PersonasPage />} />
        <Route path="edit">
          <Route path=":personaId" element={<EditPersonaPage />} />
        </Route>
      </Route>
    </Route>
  )
);
export default router;
