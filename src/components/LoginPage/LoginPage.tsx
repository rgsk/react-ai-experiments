import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import useGlobalContext from "~/hooks/useGlobalContext";
import authService from "~/lib/authService";

interface LoginPageProps {}
const LoginPage: React.FC<LoginPageProps> = ({}) => {
  const { firebaseUser } = useGlobalContext();
  const navigate = useNavigate();
  return (
    <div>
      {firebaseUser ? (
        <div>
          <p>Signed in as: {firebaseUser.email}</p>
          <Button onClick={authService.logout}>Logout</Button>
        </div>
      ) : (
        <Button
          onClick={async () => {
            const userCredential = await authService.signInWithGoogle();
            console.log({ userCredential });
            navigate("/");
          }}
        >
          Signin with Google
        </Button>
      )}
    </div>
  );
};
export default LoginPage;
