// context/GlobalContext.tsx

import { createContext, useContext } from "react";
import useFirebaseUser from "./auth/useFirebaseUser";
import useToken from "./auth/useToken";
import useUserData from "./auth/useUserData";

export const useGlobalContextValue = () => {
  const { token, tokenLoading } = useToken();
  const { firebaseUser, firebaseUserLoading } = useFirebaseUser();
  const { userData, userDataLoading, userDataUpdating } = useUserData();
  return {
    token,
    tokenLoading,
    firebaseUser,
    firebaseUserLoading,
    userData,
    userDataLoading,
    userDataUpdating,
  };
};

export const GlobalContext = createContext<ReturnType<
  typeof useGlobalContextValue
> | null>(null);

const useGlobalContext = () => {
  const value = useContext(GlobalContext)!;
  return value;
};
export default useGlobalContext;
