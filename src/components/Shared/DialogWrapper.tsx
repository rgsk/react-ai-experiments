"use client";

import * as React from "react";
import useBreakpoints from "~/hooks/useBreakpoints";
import SimpleModal from "./SimpleModal";

interface DialogWrapperProps {
  children: any;
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}
const DialogWrapper: React.FC<DialogWrapperProps> = ({
  children,
  open,
  setOpen,
  onClose,
}) => {
  const { md } = useBreakpoints();
  return (
    <>
      {md ? (
        <>
          <DesktopDialogWrapper open={open} setOpen={setOpen} onClose={onClose}>
            {children}
          </DesktopDialogWrapper>
        </>
      ) : (
        <>
          <MobileDialogWrapper open={open} setOpen={setOpen}>
            {children}
          </MobileDialogWrapper>
        </>
      )}
    </>
  );
};
export default DialogWrapper;

interface DesktopDialogWrapperProps {
  children: any;
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}
const DesktopDialogWrapper: React.FC<DesktopDialogWrapperProps> = ({
  children,
  open,
  setOpen,
  onClose,
}) => {
  return (
    <div>
      {open && (
        <SimpleModal
          onClose={() => {
            setOpen?.(false);
            onClose?.();
          }}
          maxWidth={650}
          hideCloseIcon
        >
          <div className="rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700">
            {children}
          </div>
        </SimpleModal>
      )}
    </div>
  );
};

interface MobileDialogWrapperProps {
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  children: any;
}
const MobileDialogWrapper: React.FC<MobileDialogWrapperProps> = ({
  children,
  open,
  setOpen,
}) => {
  return (
    <div>
      {open && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-background">
          {children}
        </div>
      )}
    </div>
  );
};
