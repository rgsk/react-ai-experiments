import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalContext from "../useGlobalContext";
const authExcludedRoutes = ["/pdf"];
const useAuthRequired = () => {
  const { firebaseUser, firebaseUserLoading } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  useEffect(() => {
    if (authExcludedRoutes.includes(pathname)) return;
    if (pathname !== "/login") {
      if (!firebaseUserLoading) {
        if (!firebaseUser) {
          navigate("/login");
        }
      }
    }
  }, [firebaseUser, firebaseUserLoading, navigate, pathname]);
};
export default useAuthRequired;
