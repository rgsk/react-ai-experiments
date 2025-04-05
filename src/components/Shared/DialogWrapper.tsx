"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import useBreakpoints from "~/hooks/useBreakpoints";

interface DialogWrapperProps {
  children: any;
  triggerComponent: any;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const DialogWrapper: React.FC<DialogWrapperProps> = ({
  triggerComponent,
  children,
  open,
  setOpen,
}) => {
  const { md } = useBreakpoints();
  return (
    <>
      {md ? (
        <>
          <DesktopDialogWrapper
            triggerComponent={triggerComponent}
            open={open}
            setOpen={setOpen}
          >
            {children}
          </DesktopDialogWrapper>
        </>
      ) : (
        <>
          <MobileDialogWrapper
            triggerComponent={triggerComponent}
            open={open}
            setOpen={setOpen}
          >
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
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerComponent: any;
}
const DesktopDialogWrapper: React.FC<DesktopDialogWrapperProps> = ({
  children,
  open,
  setOpen,
  triggerComponent,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent
        hideCloseIcon
        className="min-w-[650px] p-0 gap-0 bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700"
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

interface MobileDialogWrapperProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: any;
  triggerComponent: any;
}
const MobileDialogWrapper: React.FC<MobileDialogWrapperProps> = ({
  children,
  open,
  setOpen,
  triggerComponent,
}) => {
  return (
    <div>
      <div
        onClick={() => {
          setOpen(true);
        }}
      >
        {triggerComponent}
      </div>
      {open && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-background">
          {children}
        </div>
      )}
    </div>
  );
};
