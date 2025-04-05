import { Home, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useGlobalContext from "~/hooks/useGlobalContext";
import authService from "~/lib/authService";
import { LoadingSpinner } from "../Shared/LoadingSpinner";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
interface NavbarProps {}
const Navbar: React.FC<NavbarProps> = ({}) => {
  const { userData, userDataLoading } = useGlobalContext();
  return (
    <div className="border-b border-b-input p-4 flex justify-between items-center gap-3">
      <Link to="/">
        <Button size="icon" variant="outline">
          <Home />
        </Button>
      </Link>
      <div className="flex gap-2 items-center">
        <ModeToggle />
        <>
          {userDataLoading ? (
            <div className="w-[36px] h-[36px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {userData ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none border-2 border-transparent hover:border-input w-[36px] h-[36px] rounded-full overflow-hidden">
                      <img
                        src={userData.avatarUrl}
                        alt="profile photo"
                        className="w-full h-full"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    avoidCollisions
                    align="end"
                    side="bottom"
                  >
                    <DropdownMenuItem>
                      <span className="flex flex-col">
                        <span>{userData.name}</span>
                        <span>{userData.email}</span>
                      </span>
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem onClick={authService.logout}>
                      <LogOut />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">Sign in</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
};
export default Navbar;
