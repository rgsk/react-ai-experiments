import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "~/lib/firebaseApp";

const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] = useState<User>();
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
