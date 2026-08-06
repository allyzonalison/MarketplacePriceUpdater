interface StatusModalProps {
  isOpen: boolean;
  title: string;
  description: string;

  buttonText?: string;

  type?: "success" | "error" | "warning" | "info";

  onClose: () => void;
}

const StatusModal = ({
  isOpen,
  title,
  description,
  buttonText = "OK",
  type = "success",
  onClose,
}: StatusModalProps) => {
  if (!isOpen) return null;

  const icon = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  }[type];

  const color = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-[430px] rounded-xl bg-white p-8 shadow-2xl">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white ${color}`}
        >
          {icon}
        </div>

        <h2 className="mt-6 text-center text-2xl font-semibold">{title}</h2>

        <p className="mt-3 text-center text-gray-500">{description}</p>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default StatusModal;
