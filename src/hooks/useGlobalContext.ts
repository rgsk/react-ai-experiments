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
import useLocalStorageState from "./useLocalStorageState";

export const getToken = async () => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  return token;
};
export enum LogLevel {
  // TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  // WARN = "WARN",
  // ERROR = "ERROR",
  // FATAL = "FATAL"
}

export const useGlobalContextValue = () => {
  const [firebaseUser, setFirebaseUser] = useState<User>();
  const [firebaseUserLoading, setFirebaseUserLoading] = useState(true);
  const isFirstHistoryEntryRenderRef = useRef(true);
  const [logLevel, setLogLevel] = useLocalStorageState<LogLevel>(
    "logLevel",
    LogLevel.DEBUG
  );

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
    });
  }, []);

  useEffect(() => {
    if (
      !userDataLoading &&
      !userData &&
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
  }, [firebaseUser, setUserData, userData, userDataLoading]);

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
    isFirstHistoryEntryRenderRef,
    logLevel,
    setLogLevel,
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
