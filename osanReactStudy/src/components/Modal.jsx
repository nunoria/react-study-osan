import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "../lib/util";

const ModalContext = createContext(null);

function Modal({ children, className }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const contextValue = { open, openModal, closeModal };

  return (
    <ModalContext.Provider value={contextValue}>
      {open &&
        createPortal(
          <div
            className={cn("fixed inset-0 z-50 bg-black/50", className)}
            onClick={closeModal}
          />,
          document.body
        )}
      {children}
    </ModalContext.Provider>
  );
}

const _useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within <Modal>");
  }
  return context;
};

function ModalTrigger({ children, className }) {
  const { openModal } = _useModalContext();

  return (
    <div
      onClick={openModal}
      className={cn("cursor-pointer inline-block", className)}
    >
      {children}
    </div>
  );
}

function ModalContent({ children, className }) {
  const { open, closeModal } = _useModalContext();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
      <div
        className={cn(
          "relative bg-white p-6 rounded-lg shadow-xl pointer-events-auto z-50 min-w-300pxr",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <X
          className="absolute right-1 top-1 w-20pxr text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={() => closeModal()}
        />
        {children}
      </div>
    </div>,
    document.body
  );
}

export { Modal, ModalTrigger, ModalContent };
