import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth } from "./firebaseApp";

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(firebaseAuth, provider);
  return userCredential;
};

const logout = async () => {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.error("Error logging out:", error);
    let errorMessage: string;
    errorMessage = "An unexpected error occurred. Please try again.";
    throw new Error(errorMessage);
  }
};

const authService = {
  signInWithGoogle,
  logout,
};
export default authService;
