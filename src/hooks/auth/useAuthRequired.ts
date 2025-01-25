import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useToken from "./useToken";

const useAuthRequired = () => {
  const { token, tokenLoading } = useToken();
  const navigate = useNavigate();
  useEffect(() => {
    if (!tokenLoading) {
      if (!token) {
        navigate("/login");
      }
    }
  }, [navigate, token, tokenLoading]);
};
export default useAuthRequired;
