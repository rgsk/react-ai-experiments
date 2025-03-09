interface DraggingBackdropProps {}
export const DraggingBackdrop: React.FC<DraggingBackdropProps> = ({}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="text-gray-100 text-center">
        <p className="text-[18px] font-bold">Add anything</p>
        <p className="text-[14px]">
          Drop any file here to add it to the conversation
        </p>
      </div>
    </div>
  );
};
