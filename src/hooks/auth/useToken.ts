import { useEffect, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";
import useLocalStorageState, {
  localStorageWithExpiry,
} from "../useLocalStorageState";
export const getToken = () => {
  const token = localStorageWithExpiry.getItem<string>("token");
  if (!token) {
    // window.location.href = "/login";
    throw new Error("Please login to continue");
  }
  return token;
};
export default function useToken() {
  const [token, setToken] = useLocalStorageState<string>("token");
  const [tokenLoading, setTokenLoading] = useState(true);
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(undefined);
      }
      setTokenLoading(false);
    });
  }, [setToken]);
  return { token, tokenLoading };
}
