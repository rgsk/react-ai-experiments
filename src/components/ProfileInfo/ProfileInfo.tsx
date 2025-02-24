import useGlobalContext from "~/hooks/useGlobalContext";

interface ProfileInfoProps {}
const ProfileInfo: React.FC<ProfileInfoProps> = ({}) => {
  const { userData } = useGlobalContext();
  if (!userData) return null;
  return (
    <div>
      <div className="border rounded-[6px] py-[8px] px-[12px] cursor-pointer">
        <div className="flex gap-[10px]">
          <div className="rounded-full overflow-hidden min-w-[20px] h-[20px] relative">
            <img
              src={userData.avatarUrl}
              alt="profile photo"
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-sm">{userData.name}</span>
            <span className="text-xs">{userData.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileInfo;
