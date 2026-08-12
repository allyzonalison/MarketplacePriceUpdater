import { useEffect, useState } from "react";

import {
  previewGroupPrice,
  applyGroupPrice,
  getCurrentPrices,
  type CurrentPrices,
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
  const [supplier, setSupplier] = useState("ALL");
  const [pricePerGram, setPricePerGram] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPrices, setCurrentPrices] = useState<CurrentPrices | null>(
    null
  );

  const [isShopeeModalOpen, setIsShopeeModalOpen] = useState(false);

  const { showProgress } = useProgress();

  const loadCurrentPrices = async () => {
    try {
      const prices = await getCurrentPrices();

      console.log("Prices from API:", prices);

      setCurrentPrices(prices);
    } catch (error) {
      console.error("Failed to load current prices:", error);
    }
  };

  useEffect(() => {
    loadCurrentPrices();
  }, []);

  const handlePreview = async () => {
    if (!group || !pricePerGram) {
      alert("Please select a group and enter a price.");
      return;
    }

    try {
      setLoading(true);

      const previewProducts = await previewGroupPrice({
        group,
        supplier,
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
        supplier,
        pricePerGram: Number(pricePerGram),
      });

      await onApplySuccess();

      await loadCurrentPrices();

      alert("Prices applied successfully!");
    } catch (error) {
      console.error("PRICE APPLY ERROR:", error);

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

          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="ALL">All Suppliers</option>
            <option value="668">668</option>
            <option value="FG">FG</option>
            <option value="SK">SK</option>
            <option value="GS">GS</option>
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
              <span>
                ₱{currentPrices?.regularItems?.toLocaleString() ?? "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Electroform</span>
              <span>
                ₱{currentPrices?.electroform?.toLocaleString() ?? "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>24K Gold Rings</span>
              <span>₱{currentPrices?.rings24k?.toLocaleString() ?? "-"}</span>
            </div>

            <div className="flex justify-between">
              <span>Couple Rings</span>
              <span>
                ₱{currentPrices?.coupleRings?.toLocaleString() ?? "-"}
              </span>
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

        <hr className="my-8" />

        <button
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to sign out?"
            );

            if (!confirmed) {
              return;
            }

            localStorage.removeItem("token");
            window.location.reload();
          }}
          className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Sign Out
        </button>
      </aside>

      <MarketplaceExportModal
        isOpen={isShopeeModalOpen}
        marketplace="Shopee"
        onClose={() => setIsShopeeModalOpen(false)}
        onGenerate={async (files) => {
          try {
            const blob = await exportShopee(files);

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = "Shopee_Updated.zip";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error("EXPORT ERROR:", err);
            throw err;
          }
        }}
      />
    </>
  );
};

export default Sidebar;
