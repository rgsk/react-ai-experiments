// context/GlobalContext.tsx

import { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";
import { firebaseAuth } from "~/lib/firebaseApp";
import { CreditDetails, UserData } from "~/lib/typesJsonData";
import experimentsService from "~/services/experimentsService";
import useJsonData from "./useJsonData";
import useLocalStorageState, {
  localStorageWithExpiry,
} from "./useLocalStorageState";
import useRunOnWindowFocus from "./useRunOnWindowFocus";
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
  const [isFirstHistoryRender, setIsFirstHistoryRender] = useState(true);

  const [
    creditDetails,
    ,
    { loading: creditDetailsLoading, refetch: refetchCreditDetails },
  ] = useJsonData<CreditDetails>(
    `admin/public/creditDetails/${firebaseUser?.email}`,
    undefined,
    { enabled: !!firebaseUser }
  );
  const [creditsOverMessage, setCreditsOverMessage] = useState<string>();

  const [firebaseUserLoading, setFirebaseUserLoading] = useState(true);
  const [
    userData,
    setUserData,
    { loading: userDataLoading, updating: userDataUpdating },
  ] = useJsonData<UserData>("userData");
  const currentExecuteCodeRef = useRef<React.MutableRefObject<() => void>>();

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
  useRunOnWindowFocus(() => {
    // this ensures token is refreshed if expired on window focus
    firebaseAuth.currentUser?.getIdToken();
  });
  useEffect(() => {
    if (
      !userDataLoading &&
      !userData &&
      token &&
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

  const deductCredits = useCallback(async () => {
    const deductCreditsResponse = await experimentsService.deductCredits();
    if (!deductCreditsResponse.isAllowed) {
      setCreditsOverMessage("No more credits left. Please buy new credits.");
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (!creditDetailsLoading) {
      if (!creditDetails) {
        // initialize credits
        (async () => {
          const result = await experimentsService.initializeCredits();
          // console.log(result.value.balance);
          refetchCreditDetails();
        })();
      }
    }
  }, [creditDetails, creditDetailsLoading, refetchCreditDetails]);

  return {
    token,
    tokenLoading,
    firebaseUser,
    firebaseUserLoading,
    userData,
    userDataLoading,
    userDataUpdating,
    currentExecuteCodeRef,
    creditDetails,
    deductCredits,
    creditsOverMessage,
    setCreditsOverMessage,
    isFirstHistoryRender,
    setIsFirstHistoryRender,
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
