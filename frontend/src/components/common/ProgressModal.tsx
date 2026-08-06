interface ProgressModalProps {
  visible: boolean;
  title: string;
}

const ProgressModal = ({ visible, title }: ProgressModalProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-[420px] rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while the system updates your products.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Do not close this window.
        </p>
      </div>
    </div>
  );
};

export default ProgressModal;
