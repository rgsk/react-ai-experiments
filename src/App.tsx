import { Outlet } from "react-router-dom";
import useAuthRequired from "./hooks/auth/useAuthRequired";
import environmentVars from "./lib/environmentVars";

function App() {
  console.log({ environmentVars });
  useAuthRequired();
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
