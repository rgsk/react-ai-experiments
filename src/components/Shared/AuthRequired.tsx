import useToken from "~/hooks/auth/useToken";

interface AuthRequiredProps {}
const AuthRequired: React.FC<AuthRequiredProps> = ({}) => {
  const { token, tokenLoading } = useToken();
  return <div>AuthRequired</div>;
};
export default AuthRequired;
