// context/GlobalContext.tsx

import { createContext, useContext } from "react";
import useFirebaseUser from "./auth/useFirebaseUser";
import useToken from "./auth/useToken";

export const useGlobalContextValue = () => {
  const { token, tokenLoading } = useToken();
  const { firebaseUser, firebaseUserLoading } = useFirebaseUser();

  return { token, tokenLoading, firebaseUser, firebaseUserLoading };
};

export const GlobalContext = createContext<ReturnType<
  typeof useGlobalContextValue
> | null>(null);

const useGlobalContext = () => {
  const value = useContext(GlobalContext)!;
  return value;
};
export default useGlobalContext;
