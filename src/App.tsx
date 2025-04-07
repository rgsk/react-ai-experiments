import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import CentralLoader from "./components/Shared/CentralLoader";
import CreditsOverModal from "./components/Shared/CreditsOverModal";
import useAuthRequired from "./hooks/auth/useAuthRequired";
import usePathname from "./hooks/usePathname";
import { useWindowSize } from "./hooks/useWindowSize";
import environmentVars from "./lib/environmentVars";
import useGlobalContext from "./providers/context/useGlobalContext";

function App() {
  useEffect(() => {
    console.log({ environmentVars });
  }, []);
  const {
    firebaseUserLoading,
    firebaseUser,
    creditsOverMessage,
    setCreditsOverMessage,
  } = useGlobalContext();
  const [canAccessAdminPath, setCanAccessAdminPath] = useState(false);
  useAuthRequired();
  const windowSize = useWindowSize();
  const pathname = usePathname();
  const isAdminPath = useMemo(() => pathname.startsWith("/admin"), [pathname]);
  useEffect(() => {
    if (isAdminPath) {
      if (!firebaseUserLoading && firebaseUser) {
        if (firebaseUser.email === "rahulguptasde@gmail.com") {
          setCanAccessAdminPath(true);
        }
      }
    }
  }, [firebaseUser, firebaseUserLoading, isAdminPath]);
  return (
    <div>
      {creditsOverMessage && (
        <CreditsOverModal
          message={creditsOverMessage}
          onClose={() => setCreditsOverMessage(undefined)}
        />
      )}
      <div className="flex flex-col" style={{ height: windowSize.height }}>
        <div>
          <Navbar />
        </div>
        <div className="flex-1 overflow-auto">
          {firebaseUserLoading ? (
            <CentralLoader />
          ) : (
            <>
              {isAdminPath ? (
                canAccessAdminPath ? (
                  <Outlet />
                ) : (
                  <>
                    <p>no admin access</p>
                  </>
                )
              ) : (
                <Outlet />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
