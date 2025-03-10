interface SimpleModalProps {
  onClose: () => void;
  children: any;
  maxWidth?: number;
}
const SimpleModal: React.FC<SimpleModalProps> = ({
  onClose,
  children,
  maxWidth = 300,
}) => {
  return (
    <div>
      <div className="fixed inset-0 z-[100]">
        <div
          className="fixed h-full w-full bg-[#000] bg-opacity-20 backdrop-filter backdrop-blur-[2px]"
          onClick={onClose}
        ></div>
        <div className="flex items-center justify-center h-screen">
          <div
            className="w-[80%] z-[1000] relative"
            style={{ maxWidth: maxWidth }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SimpleModal;
