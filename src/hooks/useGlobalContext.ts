// context/GlobalContext.tsx

import { User } from "firebase/auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { firebaseAuth } from "~/lib/firebaseApp";
import { UserData } from "~/lib/typesJsonData";
import useJsonData from "./useJsonData";
import useLocalStorageState, {
  localStorageWithExpiry,
} from "./useLocalStorageState";
export const getToken = () => {
  const token = localStorageWithExpiry.getItem<string>("token");
  if (!token) {
    // window.location.href = "/login";
    throw new Error("Please login to continue");
  }
  return token;
};
export const useGlobalContextValue = () => {
  const [token, setToken] = useLocalStorageState<string>("token");
  const [tokenLoading, setTokenLoading] = useState(true);

  const [firebaseUser, setFirebaseUser] = useState<User>();
  const [firebaseUserLoading, setFirebaseUserLoading] = useState(true);
  const [
    userData,
    setUserData,
    { loading: userDataLoading, updating: userDataUpdating },
  ] = useJsonData<UserData>("userData");

  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user ?? undefined);
      setFirebaseUserLoading(false);
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(undefined);
      }
      setTokenLoading(false);
    });
  }, [setToken]);
  useEffect(() => {
    if (
      !userDataLoading &&
      !userData &&
      token && // token condition is important
      firebaseUser &&
      firebaseUser.email &&
      firebaseUser.photoURL &&
      firebaseUser.displayName
    ) {
      setUserData({
        id: v4(),
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        createdAt: new Date().toISOString(),
      });
    }
  }, [firebaseUser, setUserData, token, userData, userDataLoading]);
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
