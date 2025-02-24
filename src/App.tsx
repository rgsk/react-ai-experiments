import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import CentralLoader from "./components/Shared/CentralLoader";
import CreditsOverModal from "./components/Shared/CreditsOverModal";
import useAuthRequired from "./hooks/auth/useAuthRequired";
import useGlobalContext from "./hooks/useGlobalContext";
import usePathname from "./hooks/usePathname";
import environmentVars from "./lib/environmentVars";

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
    <div className="h-screen overflow-auto">
      {creditsOverMessage && (
        <CreditsOverModal
          message={creditsOverMessage}
          onClose={() => setCreditsOverMessage(undefined)}
        />
      )}
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
  );
}

export default App;
