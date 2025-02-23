import { Outlet } from "react-router-dom";
import environmentVars from "./lib/environmentVars";

function App() {
  console.log({ environmentVars });
  return (
    <div className="h-screen overflow-auto">
      <Outlet />
    </div>
  );
}

export default App;
