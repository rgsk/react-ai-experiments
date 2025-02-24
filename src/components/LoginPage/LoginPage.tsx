import { Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalContext from "~/hooks/useGlobalContext";
import authService from "~/lib/authService";
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { Button } from "../ui/button";

interface LoginPageProps {}
const LoginPage: React.FC<LoginPageProps> = ({}) => {
  const { firebaseUser, firebaseUserLoading } = useGlobalContext();
  const navigate = useNavigate();
  return (
    <div className="bg-background w-screen h-screen flex items-center justify-center">
      {firebaseUserLoading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
        <div className="border rounded-xl p-8 w-full max-w-md">
          {firebaseUser ? (
            <div>
              <p>Logged in as:</p>
              <div className="h-[10px]"></div>
              <ProfileInfo />
              <div className="h-[30px]"></div>
              <div className="flex justify-between">
                <Link to="/">
                  <Button variant="outline">
                    <Home />
                    <span>Go to Home Page</span>
                  </Button>
                </Link>
                <Button variant="outline" onClick={authService.logout}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center">
                <img
                  src="https://portfolio-nine-nu-87.vercel.app/_next/image?url=%2Fmf-avatar.svg&w=384&q=75"
                  alt="emily logo"
                  width={40}
                  height={40}
                />
                <div className="h-[20px]"></div>
                <h1 className="text-[24px] font-semibold">
                  Login to Experiments
                </h1>
              </div>
              <div className="h-[40px]"></div>
              <Button
                variant="outline"
                className="w-full h-[50px]"
                onClick={async () => {
                  const userCredential = await authService.signInWithGoogle();
                  console.log({ userCredential });
                  navigate("/");
                }}
              >
                <span>
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/assets.growthschool.io/google.svg"
                    alt="google logo"
                    width={20}
                    height={20}
                  />
                </span>
                <span>Continue with Google</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default LoginPage;
