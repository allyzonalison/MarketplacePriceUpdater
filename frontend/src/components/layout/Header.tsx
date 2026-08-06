interface ToolbarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;

  selectedFilter: string;
  onSelectedFilterChange: (value: string) => void;

  onAddProduct: () => void;
  onEditProduct: () => void;
  onDeleteProduct: () => void;
}

const Toolbar = ({
  searchText,
  onSearchTextChange,

  selectedFilter,
  onSelectedFilterChange,

  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ToolbarProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Search + Filter */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            className="w-150 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />

          <select
            value={selectedFilter}
            onChange={(e) => onSelectedFilterChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="all">All Products</option>

            <optgroup label="Categories">
              <option value="Earrings">Earrings</option>
              <option value="Pendants">Pendants</option>
              <option value="Bracelet_Anklet">Bracelet_Anklet</option>
              <option value="Necklace">Necklace</option>
              <option value="Ring">Ring</option>
            </optgroup>

            <optgroup label="Special">
              <option value="Electroform">Electroform</option>
              <option value="Couple Rings">Couple Rings</option>
              <option value="24K Gold Rings">24K Gold Rings</option>
              <option value="Manual Pricing">Manual Pricing</option>
            </optgroup>

            <optgroup label="Suppliers">
              <option value="668">668</option>
              <option value="FG">FG</option>
              <option value="SK">SK</option>
              <option value="GS">GS</option>
            </optgroup>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAddProduct}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Add Product
          </button>

          <button
            onClick={onEditProduct}
            className="rounded-lg bg-gray-200 px-5 py-2 font-medium hover:bg-gray-300"
          >
            Edit
          </button>

          <button
            onClick={onDeleteProduct}
            className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
