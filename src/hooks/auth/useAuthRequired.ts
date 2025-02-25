import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalContext from "../useGlobalContext";
const authExcludedRoutes = ["/pdf"];
const useAuthRequired = () => {
  const { token, tokenLoading } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  useEffect(() => {
    if (authExcludedRoutes.includes(pathname)) return;
    if (pathname !== "/login") {
      if (!tokenLoading) {
        if (!token) {
          navigate("/login");
        }
      }
    }
  }, [navigate, pathname, token, tokenLoading]);
};
export default useAuthRequired;
