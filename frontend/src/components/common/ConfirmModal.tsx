import type { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;

  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  danger?: boolean;

  children?: ReactNode;

  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  title,
  description,

  confirmText = "Confirm",
  cancelText = "Cancel",

  danger = false,

  children,

  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-[450px] rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold">{title}</h2>

        <p className="mt-2 text-gray-500">{description}</p>

        {children && <div className="mt-6">{children}</div>}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2 text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
