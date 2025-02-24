import { useNavigate } from "react-router-dom";
import useGlobalContext from "~/hooks/useGlobalContext";
import authService from "~/lib/authService";
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import { LoadingSpinner } from "../Shared/LoadingSpinner";

interface LoginPageProps {}
const LoginPage: React.FC<LoginPageProps> = ({}) => {
  const { firebaseUser, firebaseUserLoading } = useGlobalContext();
  const navigate = useNavigate();
  return (
    <div className="bg-[#F3F4F6] w-screen h-screen flex items-center justify-center">
      {firebaseUserLoading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
          {firebaseUser ? (
            <div>
              <p className="text-sm">Signed in as:</p>
              <div className="h-[10px]"></div>
              <ProfileInfo />
              <div className="h-[10px]"></div>
              <button
                onClick={authService.logout}
                className="border border-[#030A211A] rounded-[6px] px-[12px] py-[8px] text-[14px]"
              >
                Logout
              </button>
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
              <button
                onClick={async () => {
                  const userCredential = await authService.signInWithGoogle();
                  console.log({ userCredential });
                  navigate("/");
                }}
                className="flex justify-center font-semibold gap-3 items-center border border-gray-300 rounded-lg w-full py-3"
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
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default LoginPage;
