import { useEffect, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";
import useLocalStorageState from "../useLocalStorageState";

export default function useToken() {
  const [token, setToken] = useLocalStorageState<string | null>("token", null);
  const [tokenLoading, setTokenLoading] = useState(true);
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
      setTokenLoading(false);
    });
  }, [setToken]);
  return { token, tokenLoading };
}
