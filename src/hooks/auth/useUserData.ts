import { useEffect } from "react";
import { v4 } from "uuid";
import { UserData } from "~/lib/typesJsonData";
import useJsonData from "../useJsonData";
import useFirebaseUser from "./useFirebaseUser";

const useUserData = () => {
  const [
    userData,
    setUserData,
    { loading: userDataLoading, updating: userDataUpdating },
  ] = useJsonData<UserData>("userData");
  const { firebaseUser } = useFirebaseUser();
  useEffect(() => {
    if (
      !userDataLoading &&
      !userData &&
      firebaseUser &&
      firebaseUser.email &&
      firebaseUser.displayName
    ) {
      setUserData({
        id: v4(),
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        createdAt: new Date().toISOString(),
      });
    }
  }, [firebaseUser, setUserData, userData, userDataLoading]);
  return {
    userData,
    userDataLoading,
    userDataUpdating,
  };
};
export default useUserData;
