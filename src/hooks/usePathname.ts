import { useLocation } from "react-router-dom";

const usePathname = () => {
  const location = useLocation();
  const pathname = location.pathname;
  return pathname;
};
export default usePathname;
