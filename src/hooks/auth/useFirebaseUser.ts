import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";
import useLocalStorageState, {
  localStorageWithExpiry,
} from "../useLocalStorageState";
export const getFirebaseUser = () => {
  const firebaseUser = localStorageWithExpiry.getItem<User>("firebaseUser");
  if (!firebaseUser) {
    window.location.href = "/login";
    throw new Error("Please login to continue");
  }
  return firebaseUser;
};
const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] =
    useLocalStorageState<User>("firebaseUser");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user ?? undefined);
      setLoading(false);
    });
  }, [setFirebaseUser]);
  return { firebaseUser, firebaseUserLoading: loading };
};

export default useFirebaseUser;
