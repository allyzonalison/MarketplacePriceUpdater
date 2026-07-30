const Sidebar = () => {
  return (
    <aside className="w-72 border-r border-gray-200 bg-white p-6">
      {/* Price Update */}

      <div>
        <h2 className="mb-4 text-lg font-semibold">New Price Per Gram</h2>

        <select className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2">
          <option>Select Price Group</option>
          <option>Regular Items</option>
          <option>Electroform</option>
          <option>24K Gold Rings</option>
          <option>Couple Rings</option>
          <option>Supplier "668"</option>
          <option>Supplier "SK"</option>
          <option>Supplier "GS"</option>
          <option>Supplier "FG"</option>
        </select>

        <input
          type="number"
          placeholder="New price per gram"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
        />

        <div className="flex gap-2">
          <button className="flex-1 rounded-lg bg-gray-200 py-2 font-medium hover:bg-gray-300">
            Preview
          </button>

          <button className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700">
            Apply
          </button>
        </div>
      </div>

      <hr className="my-8" />

      {/* Current Prices */}

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

      {/* Marketplace */}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Bulk Update Marketplace</h2>

        <div className="space-y-3">
          <button className="w-full rounded-lg bg-[#FF6A00] py-3 font-semibold text-white hover:opacity-90">
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
  );
};

export default Sidebar;
