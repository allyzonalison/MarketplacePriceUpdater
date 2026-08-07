import { useEffect, useState } from "react";

import ProductInformation from "./ProductInformation";
import VariantToolbar from "./VariantToolbar";
import VariantsGrid from "./VariantsGrid";
/*import { calculateSellingPrice } from "./PriceCalculator";*/
import { validateProduct } from "./validateProduct";

import type { Product } from "../../../types/product";
import type { VariantRow } from "../../../types/variant";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../services/productService";

interface ProductModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  productGroup: Product[];

  onClose: () => void;
  onSaveSuccess: () => Promise<void>;
}

const createVariant = (): VariantRow => ({
  clientId: crypto.randomUUID(),

  id: null,

  variationName: "",
  supplier: "",

  grams: "",
  pricePerGram: null,
  sellingPrice: null,

  stock: 0,

  // Shopee
  productIdShopee: null,
  variationIdShopee: null,

  // Lazada
  productIdLazada: null,
  skuIdLazada: null,
  keyLazada: null,
  quantityLazada: null,
  variationNameLazada: null,

  // TikTok
  productIdTiktok: null,
  skuIdTiktok: null,
  categoryTiktok: null,
  quantityTiktok: null,
  variationNameTiktok: null,
});

const ProductModal = ({
  isOpen,
  isEditMode,
  productGroup,
  onClose,
  onSaveSuccess,
}: ProductModalProps) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");

  const [selectedVariantClientId, setSelectedVariantClientId] = useState<
    string | null
  >(null);

  const [rows, setRows] = useState<VariantRow[]>([createVariant()]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);

  useEffect(() => {
    console.log("======== ProductModal ========");
    console.log("isOpen:", isOpen);
    console.log("isEditMode:", isEditMode);
    console.log("productGroup length:", productGroup.length);
    console.log(productGroup);

    if (!isOpen) return;

    if (isEditMode && productGroup.length > 0) {
      console.log("Loading variants...");

      setProductName(productGroup[0].productName);
      setCategory(productGroup[0].masterCategory);

      setRows(
        productGroup.map((product) => ({
          clientId: product.id.toString(),

          id: product.id,

          variationName: product.variationNameShopee ?? "",
          supplier: product.supplier,

          grams: product.gramRange ?? "",
          pricePerGram: Number(product.pricePerGram),
          sellingPrice: Number(product.price),

          stock: product.stock,

          // Shopee
          productIdShopee: product.productIdShopee,
          variationIdShopee: product.variationIdShopee,

          // Lazada
          variationNameLazada: product.variationNameLazada,
          productIdLazada: product.productIdLazada,
          skuIdLazada: product.skuIdLazada,
          keyLazada: product.keyLazada,
          quantityLazada: product.quantityLazada,

          // TikTok
          variationNameTiktok: product.variationNameTiktok,
          productIdTiktok: product.productIdTiktok,
          skuIdTiktok: product.skuIdTiktok,
          categoryTiktok: product.categoryTiktok,
          quantityTiktok: product.quantityTiktok,
        }))
      );

      setSelectedVariantClientId(null);
    } else {
      setProductName("");
      setCategory("");

      setRows([createVariant()]);

      setSelectedVariantClientId(null);
    }
  }, [isOpen, isEditMode, productGroup]);

  const handleRowsChange = (updatedRows: VariantRow[]) => {
    setRows(updatedRows);
  };

  const handleAddVariant = () => {
    setRows((previous) => [...previous, createVariant()]);
  };

  const handleRemoveVariant = () => {
    if (!selectedVariantClientId) return;

    const rowToDelete = rows.find(
      (row) => row.clientId === selectedVariantClientId
    );

    if (!rowToDelete) return;

    // If this row already exists in the database,
    // remember its ID so we can delete it when Update is clicked.
    if (rowToDelete.id !== null) {
      setDeletedVariantIds((previous) => [...previous, rowToDelete.id!]);
    }

    setRows((previous) =>
      previous.filter((row) => row.clientId !== selectedVariantClientId)
    );

    setSelectedVariantClientId(null);
  };

  const handleDeleteVariantShopee = () => {
    if (!selectedVariantClientId) {
      alert("Please select a variant first.");
      return;
    }

    setRows((previous) =>
      previous.map((row) => {
        if (row.clientId !== selectedVariantClientId) {
          return row;
        }

        return {
          ...row,

          // Shopee only
          productIdShopee: null,
          variationIdShopee: null,
        };
      })
    );
  };

  const handleDeleteVariantLazada = () => {
    if (!selectedVariantClientId) {
      alert("Please select a variant first.");
      return;
    }

    setRows((previous) =>
      previous.map((row) => {
        if (row.clientId !== selectedVariantClientId) {
          return row;
        }

        return {
          ...row,

          variationNameLazada: null,
          productIdLazada: null,
          skuIdLazada: null,
          keyLazada: null,
          quantityLazada: null,
        };
      })
    );
  };

  const handleDeleteVariantTiktok = () => {
    if (!selectedVariantClientId) {
      alert("Please select a variant first.");
      return;
    }

    setRows((previous) =>
      previous.map((row) => {
        if (row.clientId !== selectedVariantClientId) {
          return row;
        }

        return {
          ...row,

          variationNameTiktok: null,
          productIdTiktok: null,
          skuIdTiktok: null,
          categoryTiktok: null,
          quantityTiktok: null,
        };
      })
    );
  };

  const handleDeleteOnShopee = () => {
    if (
      !window.confirm(
        "Delete Shopee information for ALL variants of this product?"
      )
    ) {
      return;
    }

    setRows((previous) =>
      previous.map((row) => ({
        ...row,

        productIdShopee: null,
        variationIdShopee: null,
      }))
    );
  };

  const handleDeleteOnLazada = () => {
    if (
      !window.confirm(
        "Delete Lazada information for ALL variants of this product?"
      )
    ) {
      return;
    }

    setRows((previous) =>
      previous.map((row) => ({
        ...row,

        variationNameLazada: null,
        productIdLazada: null,
        skuIdLazada: null,
        keyLazada: null,
        quantityLazada: null,
      }))
    );
  };

  const handleDeleteOnTiktok = () => {
    if (
      !window.confirm(
        "Delete TikTok information for ALL variants of this product?"
      )
    ) {
      return;
    }

    setRows((previous) =>
      previous.map((row) => ({
        ...row,

        variationNameTiktok: null,
        productIdTiktok: null,
        skuIdTiktok: null,
        categoryTiktok: null,
        quantityTiktok: null,
      }))
    );
  };

  const handleSave = async () => {
    const errors = validateProduct(productName, category, rows);

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      productName,
      category,

      rows: rows.map((row) => ({
        ...row,

        sellingPrice: row.sellingPrice ?? 0,
      })),
    };

    try {
      if (isEditMode) {
        rows.forEach((row) => {
          console.log(row);
        });
        await Promise.all(deletedVariantIds.map((id) => deleteProduct(id)));
        await Promise.all(
          rows.map((row) => {
            const payload = {
              productName,
              masterCategory: category,

              supplier: row.supplier,
              gramRange: row.grams.trim() === "" ? undefined : row.grams,

              pricePerGram: row.pricePerGram ?? undefined,
              price: row.sellingPrice ?? 0,

              stock: row.stock,

              // Shopee
              variationNameShopee:
                row.variationName.trim() === "" ? null : row.variationName,

              productIdShopee: row.productIdShopee,
              variationIdShopee: row.variationIdShopee,

              // Lazada
              variationNameLazada: row.variationNameLazada,
              productIdLazada: row.productIdLazada,
              skuIdLazada: row.skuIdLazada,
              keyLazada: row.keyLazada,
              quantityLazada: row.quantityLazada,

              // TikTok
              variationNameTiktok: row.variationNameTiktok,
              productIdTiktok: row.productIdTiktok,
              skuIdTiktok: row.skuIdTiktok,
              categoryTiktok: row.categoryTiktok,
              quantityTiktok: row.quantityTiktok,
            };

            if (row.id !== null) {
              return updateProduct(row.id, payload);
              console.log(payload);
            }

            return createProduct({
              productName,
              category,
              rows: [
                {
                  variationName: row.variationName,
                  supplier: row.supplier,

                  grams: row.grams,
                  pricePerGram:
                    row.pricePerGram == null ? null : Number(row.pricePerGram),
                  sellingPrice: row.sellingPrice ?? 0,

                  stock: row.stock,
                },
              ],
            });
          })
        );

        setDeletedVariantIds([]);
        alert("Product updated successfully!");
      } else {
        await createProduct(payload);

        alert("Product saved successfully!");
      }

      await onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        isEditMode ? "Unable to update product." : "Unable to save product."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-[95vw] max-w-[1700px] flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h2>

          <button onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ProductInformation
            productName={productName}
            category={category}
            onProductNameChange={setProductName}
            onCategoryChange={setCategory}
          />

          <div className="mt-6">
            <VariantToolbar
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onDeleteVariantShopee={handleDeleteVariantShopee}
              onDeleteVariantLazada={handleDeleteVariantLazada}
              onDeleteVariantTiktok={handleDeleteVariantTiktok}
            />

            <VariantsGrid
              isEditMode={isEditMode}
              rows={rows}
              onRowsChange={handleRowsChange}
              onSelectedRowChange={setSelectedVariantClientId}
            />

            <div className="mt-5 border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-600">
                Marketplace Actions
              </h3>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDeleteOnShopee}
                  className="rounded-lg border border-orange-500 px-4 py-2 font-medium text-orange-600 hover:bg-orange-50"
                >
                  Delete on Shopee
                </button>

                <button
                  onClick={handleDeleteOnLazada}
                  className="rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
                >
                  Delete on Lazada
                </button>

                <button
                  onClick={handleDeleteOnTiktok}
                  className="rounded-lg border border-gray-800 px-4 py-2 font-medium text-gray-800 hover:bg-gray-100"
                >
                  Delete on TikTok
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border px-5 py-2">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
