import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";
import useLocalStorageState from "../useLocalStorageState";
const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] = useLocalStorageState<User | null>(
    "firebaseUser",
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user as User);
      setLoading(false);
    });
  }, [setFirebaseUser]);
  return { firebaseUser, firebaseUserLoading: loading };
};

export default useFirebaseUser;
