const Toolbar = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Search + Filter */}

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            className="w-80 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />

          <select className="rounded-lg border border-gray-300 px-4 py-2">
            <option>All Categories</option>

            <option>Earrings</option>
            <option>Pendants</option>
            <option>Bracelet_Anklet</option>
            <option>Necklace</option>
            <option>Ring</option>
            <option>Electroform</option>
            <option>Couple Rings</option>
            <option>24K Gold Rings</option>
            <option>Manual Pricing</option>
          </select>
        </div>

        {/* Buttons */}

        <div className="flex gap-2">
          <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">
            Add Product
          </button>

          <button className="rounded-lg bg-gray-200 px-5 py-2 font-medium hover:bg-gray-300">
            Edit
          </button>

          <button className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
