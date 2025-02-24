import { Outlet } from "react-router-dom";
import CentralLoader from "./components/Shared/CentralLoader";
import useAuthRequired from "./hooks/auth/useAuthRequired";
import useGlobalContext from "./hooks/useGlobalContext";
import environmentVars from "./lib/environmentVars";

function App() {
  console.log({ environmentVars });
  const { firebaseUserLoading } = useGlobalContext();
  useAuthRequired();
  return (
    <div className="h-screen overflow-auto">
      {firebaseUserLoading ? <CentralLoader /> : <Outlet />}
    </div>
  );
}

export default App;
