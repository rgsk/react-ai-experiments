import { Outlet } from "react-router-dom";
import CentralLoader from "./components/Shared/CentralLoader";
import useGlobalContext from "./hooks/useGlobalContext";
import environmentVars from "./lib/environmentVars";

function App() {
  console.log({ environmentVars });
  const { firebaseUserLoading } = useGlobalContext();
  return (
    <div className="h-screen overflow-auto">
      {firebaseUserLoading ? <CentralLoader /> : <Outlet />}
    </div>
  );
}

export default App;
