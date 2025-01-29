// context/GlobalContext.tsx

import { createContext, useContext, useRef } from "react";
import useFirebaseUser from "./auth/useFirebaseUser";
import useToken from "./auth/useToken";
import useUserData from "./auth/useUserData";

export const useGlobalContextValue = () => {
  const { token, tokenLoading } = useToken();
  const { firebaseUser, firebaseUserLoading } = useFirebaseUser();
  const { userData, userDataLoading, userDataUpdating } = useUserData();
  const currentExecuteCodeRef = useRef<React.MutableRefObject<() => void>>();

  return {
    token,
    tokenLoading,
    firebaseUser,
    firebaseUserLoading,
    userData,
    userDataLoading,
    userDataUpdating,
    currentExecuteCodeRef,
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
