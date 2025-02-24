import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import CentralLoader from "./components/Shared/CentralLoader";
import CreditsOverModal from "./components/Shared/CreditsOverModal";
import useAuthRequired from "./hooks/auth/useAuthRequired";
import useGlobalContext from "./hooks/useGlobalContext";
import environmentVars from "./lib/environmentVars";

function App() {
  useEffect(() => {
    console.log({ environmentVars });
  }, []);
  const { firebaseUserLoading, creditsOverMessage, setCreditsOverMessage } =
    useGlobalContext();
  useAuthRequired();
  return (
    <div className="h-screen overflow-auto">
      {creditsOverMessage && (
        <CreditsOverModal
          message={creditsOverMessage}
          onClose={() => setCreditsOverMessage(undefined)}
        />
      )}
      {firebaseUserLoading ? <CentralLoader /> : <Outlet />}
    </div>
  );
}

export default App;
