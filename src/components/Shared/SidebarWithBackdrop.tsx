// SidebarWithBackdrop.tsx
import { AnimatePresence, motion } from "framer-motion";

interface SidebarWithBackdropProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width: number;
  side?: "left" | "right"; // optional prop with default "left"
}

const SidebarWithBackdrop: React.FC<SidebarWithBackdropProps> = ({
  open,
  onClose,
  children,
  width,
  side = "left", // default to left
}) => {
  const positionClass = side === "left" ? "left-0" : "right-0";
  const initialX = side === "left" ? -width : width;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.div
            className={`fixed top-0 h-full bg-white shadow-lg z-50 ${positionClass}`}
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            style={{ width: width }}
            transition={{ type: "tween", duration: 0.1, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarWithBackdrop;
