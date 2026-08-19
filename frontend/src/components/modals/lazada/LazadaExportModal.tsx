import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useProgress } from "../../../hooks/useProgress";

interface LazadaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (file: File) => Promise<void>;
}

const LazadaExportModal = ({
  isOpen,
  onClose,
  onGenerate,
}: LazadaExportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { showProgress, hideProgress } = useProgress();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!file) {
      alert("Please select a Lazada Excel template.");
      return;
    }

    try {
      setLoading(true);

      // Close the export modal first
      onClose();

      // Show the progress modal
      showProgress("Generating Lazada Export...");

      await onGenerate(file);

      // Clear selected file after successful generation
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate Lazada export.");
    } finally {
      hideProgress();
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);

    // Allow re-selecting the same file later
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[600px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Lazada Export</h2>

        <p className="mt-2 text-gray-500">Upload the Lazada Excel Template.</p>

        <div
          className="mt-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-10 text-center hover:bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          <p className="font-medium">Click to choose Excel file</p>

          <p className="mt-2 text-sm text-gray-500">Supports .xlsx file</p>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] ?? null;
              setFile(selectedFile);
            }}
          />
        </div>

        {file && (
          <div className="mt-6 max-h-40 overflow-y-auto rounded-lg border p-3">
            <div className="flex items-center justify-between rounded px-2 py-2 hover:bg-gray-100">
              <span className="text-sm">📄 {file.name}</span>

              <button
                type="button"
                onClick={removeFile}
                className="rounded p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-[#6C2BD9] px-5 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LazadaExportModal;
