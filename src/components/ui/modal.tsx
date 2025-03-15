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
  alignment = "center",
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
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        alignment === "center" && "justify-center items-center",
        alignment === "top" && "justify-center items-start",
        overlayModal ? "bg-[#0c0c0d] bg-opacity-0 backdrop-blur-[1px]" : "bg-[#0c0c0d] bg-opacity-50 backdrop-blur-sm"
      )}
      onClick={(e) => {
        // Close modal when clicking on the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id={id}
        className={cn(
          "bg-white rounded-xl",
          "w-full max-w-[50vw] max-h-[80vh] border border-border",
          alignment === "center" && "p-6",
          alignment === "top" && "p-6 mt-32",
          contentClassName
        )}
      >
        {title && (
          <div className={cn("mt-2 p-2 flex items-center justify-between")}>
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
