import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  Children,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/util";

const ModalContext = createContext(null);
const ModalContentContext = createContext(null);

/*
 * Modal: 컴포넌트 Root - overlay 스타일 및 동작 제어
 * @props: onOpenChange(function (boolean) => void) - 모달 열림 상태 변경 함수, 외부에서 상태 관리시 사용
 * @props: open(boolean) - 모달 열림 상태, 외부에서 상태 관리시 사용
 * @props: closeModaldelay(number) - 모달 닫힘 딜레이, 기본값 100ms
 * :data-state: visible/invisible - 모달이 보여지는 css 상태
 */
function Modal({
  children,
  className,
  onOpenChange,
  open,
  closeModaldelay = 100,
  ...props
}) {
  const [_open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mount, setMount] = useState(false);

  const isOpen = open ? open : _open;

  const openModal = useCallback(() => {
    onOpenChange && onOpenChange(true);
    setOpen(true);
  }, [onOpenChange]);
  const closeModal = useCallback(() => {
    onOpenChange && onOpenChange(false);
    setOpen(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      setMount(true);
      setVisible(true);
    } else {
      setVisible(false);
      setTimeout(() => {
        setMount(false);
      }, closeModaldelay);
    }
  }, [isOpen]);

  const contextValue = { visible, mount, openModal, closeModal };

  return (
    <ModalContext.Provider value={contextValue}>
      {mount &&
        createPortal(
          <div
            data-state={visible ? "visible" : "invisible"}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 data-[state=visible]:animate-fadeIn data-[state=invisible]:animate-fadeOut",
              className
            )}
            onClick={closeModal}
            {...props}
          ></div>,
          document.body
        )}
      {children}
    </ModalContext.Provider>
  );
}

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within <Modal>");
  }
  return context;
};

/*
 * ModalTrigger: Modal 안에 위치해야 함
 */
function ModalTrigger({ children, className }) {
  const { openModal } = useModalContext();

  return (
    <div
      onClick={openModal}
      className={cn("cursor-pointer inline-block", className)}
    >
      {children}
    </div>
  );
}

/*
 * ModalContent: Modal 안에 위치해야 함
 */
function ModalContent({
  children,
  className,
  labelledById = "modal-title",
  describedById = "modal-desc",
  ...props
}) {
  const { visible, mount, closeModal } = useModalContext();
  const contextValue = { closeModal };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  // children 안에 ModalClose 있는지 체크
  const hasCustomClose = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ModalClose
  );

  return (
    <ModalContentContext.Provider value={contextValue}>
      {mount &&
        createPortal(
          <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledById}
              aria-describedby={describedById}
              data-state={visible ? "visible" : "invisible"}
              className={cn(
                "relative bg-white p-6 rounded-lg shadow-xl pointer-events-auto z-50 min-w-300pxr data-[state=visible]:animate-fadeIn data-[state=visible]:animate-zoomIn data-[state=invisible]:animate-fadeOut data-[state=invisible]:animate-zoomOut",
                className
              )}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {!hasCustomClose && (
                // ModalClose가 없을 경우 기본 Close 버튼
                <ModalClose className="absolute right-1 top-1 text-gray-500 hover:text-gray-700">
                  <X className="w-20pxr" />
                </ModalClose>
              )}
              {children}
            </div>
          </div>,
          document.body
        )}
    </ModalContentContext.Provider>
  );
}

const useModalContentContext = () => {
  const context = useContext(ModalContentContext);
  if (!context) {
    throw new Error(
      "ModalContent components must be used within <ModalContent>"
    );
  }
  return context;
};

/*
 * ModalClose(optional): ModalContent 안에 위치해야 함
 */
function ModalClose({ children, className }) {
  const { closeModal } = useModalContentContext();

  return (
    <div
      onClick={() => closeModal()}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </div>
  );
}

export { Modal, ModalTrigger, ModalContent, ModalClose };
