import { useState } from "react";
import {
  previewGroupPrice,
  applyGroupPrice,
} from "../../services/pricingService";
import { exportShopee } from "../../services/exportService";
import MarketplaceExportModal from "../modals/MarketplaceExportModal";
import { useProgress } from "../../hooks/useProgress";
import type { Product } from "../../types/product";

interface SidebarProps {
  onPreview: (products: Product[]) => void;
  onApplySuccess: () => Promise<void>;
}

const Sidebar = ({ onPreview, onApplySuccess }: SidebarProps) => {
  const [group, setGroup] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");
  const [loading, setLoading] = useState(false);

  const [isShopeeModalOpen, setIsShopeeModalOpen] = useState(false);

  const { showProgress } = useProgress();

  const handlePreview = async () => {
    if (!group || !pricePerGram) {
      alert("Please select a group and enter a price.");
      return;
    }

    try {
      setLoading(true);

      const previewProducts = await previewGroupPrice({
        group,
        pricePerGram: Number(pricePerGram),
      });

      onPreview(previewProducts);
    } catch (error) {
      console.error(error);
      alert("Failed to preview prices.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!group || !pricePerGram) {
      alert("Please select a group and enter a price.");
      return;
    }

    const confirmed = window.confirm("Apply these prices permanently?");

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      showProgress(`Updating ${group} products...`);

      await applyGroupPrice({
        group,
        pricePerGram: Number(pricePerGram),
      });

      await onApplySuccess();

      alert("Prices applied successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to apply prices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="w-72 border-r border-gray-200 bg-white p-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold">New Price Per Gram</h2>

          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">Select Price Group</option>
            <option value="REGULAR">Regular Items</option>
            <option value="ELECTROFORM">Electroform</option>
            <option value="RING_24K">24K Gold Rings</option>
            <option value="COUPLE">Couple Rings</option>
          </select>

          <input
            type="number"
            value={pricePerGram}
            onChange={(e) => setPricePerGram(e.target.value)}
            placeholder="New price per gram"
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
          />

          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-200 py-2 font-medium hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Previewing..." : "Preview"}
            </button>

            <button
              onClick={handleApply}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <h2 className="mb-4 text-lg font-semibold">Current Prices</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Regular Items</span>
              <span>₱9,000</span>
            </div>

            <div className="flex justify-between">
              <span>Electroform</span>
              <span>₱8,500</span>
            </div>

            <div className="flex justify-between">
              <span>24K Gold Rings</span>
              <span>₱9,500</span>
            </div>

            <div className="flex justify-between">
              <span>Couple Rings</span>
              <span>₱8,800</span>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <h2 className="mb-4 text-lg font-semibold">Marketplace Export</h2>

          <div className="space-y-3">
            <button
              onClick={() => setIsShopeeModalOpen(true)}
              className="w-full rounded-lg bg-[#FF6A00] py-3 font-semibold text-white hover:opacity-90"
            >
              Shopee
            </button>

            <button className="w-full rounded-lg bg-[#6C2BD9] py-3 font-semibold text-white hover:opacity-90">
              Lazada
            </button>

            <button className="w-full rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-900">
              TikTok
            </button>
          </div>
        </div>
      </aside>

      <MarketplaceExportModal
        isOpen={isShopeeModalOpen}
        marketplace="Shopee"
        onClose={() => setIsShopeeModalOpen(false)}
        onGenerate={async (files) => {
          const blob = await exportShopee(files);

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "Shopee_Updated.zip";
          a.click();

          window.URL.revokeObjectURL(url);
        }}
      />
    </>
  );
};

export default Sidebar;
