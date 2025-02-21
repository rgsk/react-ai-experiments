import { Outlet } from "react-router-dom";
import environmentVars from "./lib/environmentVars";

function App() {
  console.log({ environmentVars });
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
