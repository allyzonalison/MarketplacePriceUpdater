import { useRef, useState } from "react";
import { X } from "lucide-react";

interface MarketplaceExportModalProps {
  isOpen: boolean;
  marketplace: "Shopee" | "Lazada" | "TikTok";
  onClose: () => void;
  onGenerate: (files: File[]) => Promise<void>;
}

const MarketplaceExportModal = ({
  isOpen,
  marketplace,
  onClose,
  onGenerate,
}: MarketplaceExportModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (files.length === 0) {
      alert("Please select one or more Excel templates.");
      return;
    }

    try {
      setLoading(true);
      await onGenerate(files);

      // Clear selected files after successful generation
      setFiles([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to generate export.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((previous) => previous.filter((file) => file.name !== fileName));

    // Allow re-selecting the same file later
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[600px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">{marketplace} Export</h2>

        <p className="mt-2 text-gray-500">
          Upload one or more templates exported from {marketplace}.
        </p>

        <div
          className="mt-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-10 text-center hover:bg-gray-50"
          onClick={() => inputRef.current?.click()}
        >
          <p className="font-medium">Click to choose Excel files</p>

          <p className="mt-2 text-sm text-gray-500">
            Supports multiple .xlsx files
          </p>

          <input
            ref={inputRef}
            hidden
            type="file"
            multiple
            accept=".xlsx"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6 max-h-40 overflow-y-auto rounded-lg border p-3">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded px-2 py-2 hover:bg-gray-100"
              >
                <span className="text-sm">📄 {file.name}</span>

                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="rounded p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-5 py-2">
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceExportModal;
