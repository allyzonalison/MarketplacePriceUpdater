interface Props {
  isEditMode: boolean;

  onAddVariant: () => void;
  onRemoveVariant: () => void;

  onDeleteVariantShopee: () => void;
  onDeleteVariantLazada: () => void;
  onDeleteVariantTiktok: () => void;
}

const VariantToolbar = ({
  isEditMode,

  onAddVariant,
  onRemoveVariant,

  onDeleteVariantShopee,
  onDeleteVariantLazada,
  onDeleteVariantTiktok,
}: Props) => {
  return (
    <div className="mb-4 flex justify-end gap-2">
      {/* Top row */}
      <div className="mb-2 flex justify-end gap-2">
        <button
          onClick={onAddVariant}
          className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          + Add Variant
        </button>

        <button
          onClick={onRemoveVariant}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Remove Variant
        </button>
      </div>

      {/* Marketplace variant delete buttons */}
      {isEditMode && (
        <div className="flex justify-end gap-2">
          <button
            onClick={onDeleteVariantShopee}
            title="Delete Variant on Shopee"
            className="rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
          >
            Delete Variant on Shopee
          </button>

          <button
            onClick={onDeleteVariantLazada}
            title="Delete Variant on Lazada"
            className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Delete Variant on Lazada
          </button>

          <button
            onClick={onDeleteVariantTiktok}
            title="Delete Variant on TikTok"
            className="rounded-lg border border-gray-500 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Delete Variant on TikTok
          </button>
        </div>
      )}
    </div>
  );
};

export default VariantToolbar;
