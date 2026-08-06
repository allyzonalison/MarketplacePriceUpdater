interface Props {
  productName: string;
  category: string;
  onProductNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const ProductInformation = ({
  productName,
  category,
  onProductNameChange,
  onCategoryChange,
}: Props) => {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block font-medium">Product Name</label>

          <input
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Category</label>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
          >
            <option value="">Select Category</option>
            <option>Earrings</option>
            <option>Pendant</option>
            <option>Bracelet_Anklet</option>
            <option>Necklace</option>
            <option>Ring</option>
            <option>Electroform</option>
            <option>Couple Rings</option>
            <option>24K Gold Rings</option>
            <option>Manual Pricing</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductInformation;
