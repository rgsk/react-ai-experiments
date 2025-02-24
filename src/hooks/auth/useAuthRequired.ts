import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToken from "./useToken";

const useAuthRequired = () => {
  const { token, tokenLoading } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  useEffect(() => {
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
