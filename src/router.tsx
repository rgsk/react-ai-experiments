import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "~/App";
import Providers from "~/Providers";
import AdminHomePage from "./components/Admin/AdminHomePage/AdminHomePage";
import AdminJsonDataPage from "./components/Admin/AdminJsonDataPage/AdminJsonDataPage";
import AdminSingleUserPage from "./components/Admin/AdminSingleUserPage/AdminSingleUserPage";
import ChatPage from "./components/ChatPage/ChatPage";
import EditPersonaPage from "./components/EditPersonaPage/EditPersonaPage";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/LoginPage/LoginPage";
import OcrPage from "./components/OcrPage/OcrPage";
import PDFPage from "./components/PDFPage/PDFPage";
import PersonasPage from "./components/PersonasPage/PersonasPage";
import PracticePage from "./components/PracticePage/PracticePage";
import PreviewPage from "./components/PreviewPage/PreviewPage";
import SharedChatPage from "./components/SharedChatPage/SharedChatPage";
import SharedPreviewPage from "./components/SharedPreviewPage/SharedPreviewPage";
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
      <Route path="shared-chat">
        <Route path=":id" element={<SharedChatPage />} />
      </Route>
      <Route path="shared-preview">
        <Route path=":id" element={<SharedPreviewPage />} />
      </Route>
      <Route path="youtube">
        <Route path="transcript" element={<YoutubeTranscriptPage />} />
      </Route>
      <Route path="ocr">
        <Route index element={<OcrPage />} />
      </Route>

      <Route path="pdf">
        <Route index element={<PDFPage />} />
      </Route>
      <Route path="admin">
        <Route index element={<AdminHomePage />} />
        <Route path="users">
          <Route path=":userEmail" element={<AdminSingleUserPage />} />
        </Route>
        <Route path="jsonData" element={<AdminJsonDataPage />}></Route>
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
