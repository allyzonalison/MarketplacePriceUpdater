interface ProgressModalProps {
  visible: boolean;
  title: string;
  completed: number;
  total: number;
  percent: number;
}

const ProgressModal = ({
  visible,
  title,
  completed,
  total,
  percent,
}: ProgressModalProps) => {
  if (!visible) return null;

  const isIndeterminate = total === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-[420px] rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-2 text-sm text-gray-500">
          {isIndeterminate
            ? "Generating export. Please wait..."
            : "Please wait while the system updates your products."}
        </p>

        {isIndeterminate ? (
          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mt-8 h-4 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${percent}%`,
                }}
              />
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <span>
                {completed} / {total} products
              </span>

              <span className="font-semibold">{percent}%</span>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Do not close this window.
        </p>
      </div>
    </div>
  );
};

export default ProgressModal;
