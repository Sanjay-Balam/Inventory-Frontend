"use client";

import { CloseIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ModalProps {
  children: React.ReactNode;
  alignment?: "center" | "top";
  contentClassName?: string;
  title?: string;
  overlayModal?: boolean;
  onClose: () => void;
  id?: string;
}

export const Modal = ({
  children,
  alignment,
  contentClassName,
  title,
  overlayModal,
  onClose,
  id
}: ModalProps) => {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div

      className={cn(
        "fixed inset-0 z-10 flex bg-black bg-opacity-50 backdrop-blur-sm ",
        alignment === "center" && "justify-center items-center",
        alignment === "top" && "justify-center items-start",
        overlayModal && "bg-opacity-0 backdrop-blur-[1px]"
      )}
    >

      <div
        id={id}
        className={cn(
          "bg-white rounded-xl",
          // ," shadow-lg ",
          "w-full max-w-[50vw] max-h-[80vh] border border-border",
          alignment === "center" && "p-6",
          alignment === "top" && "p-6 mt-32",
          contentClassName
        )}
      >

        {title && (
          <div className="flex items-center justify-between ">
            <p className="text-sm font-normal text-[#8A8A8A]">{title}</p>
            <div
              className="cursor-pointer"
              onClick={() => {
                if (onClose) onClose();
              }}
              id="closeModalButton"
            >
              <CloseIcon className="shrink-0 aspect-square h-5 w-5 text-[#1C1B1F]" />
            </div>
          </div>
        )}

        {children}
      </div>

    </div>
  );
};
