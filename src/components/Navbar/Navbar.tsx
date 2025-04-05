import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "../Shared/ModeToggle";
import { Button } from "../ui/button";

interface NavbarProps {}
const Navbar: React.FC<NavbarProps> = ({}) => {
  return (
    <div className="border-b border-b-input p-4 flex justify-between items-center gap-3">
      <Link to="/">
        <Button size="icon" variant="outline">
          <Home />
        </Button>
      </Link>
      <ModeToggle />
    </div>
  );
};
export default Navbar;
