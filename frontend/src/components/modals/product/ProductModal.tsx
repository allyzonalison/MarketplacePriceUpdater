import { useEffect, useState } from "react";

import ProductInformation from "./ProductInformation";
import VariantToolbar from "./VariantToolbar";
import VariantsGrid from "./VariantsGrid";
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

  // User input for Lazada + TikTok
  variationName: "",

  supplier: "",

  grams: "",
  pricePerGram: null,
  sellingPrice: null,

  stock: 0,

  // Shopee
  variationNameShopee: null,
  productIdShopee: null,
  variationIdShopee: null,

  // Lazada
  variationNameLazada: null,
  productIdLazada: null,
  skuIdLazada: null,
  keyLazada: null,
  quantityLazada: null,

  // TikTok
  variationNameTiktok: null,
  productIdTiktok: null,
  skuIdTiktok: null,
  categoryTiktok: null,
  quantityTiktok: null,
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
    if (!isOpen) return;

    if (isEditMode && productGroup.length > 0) {
      setProductName(productGroup[0].productName);
      setCategory(productGroup[0].masterCategory);

      setRows(
        productGroup.map((product) => ({
          clientId: product.id.toString(),

          id: product.id,

          /*
           * The editable "Variation" field is now based on Lazada.
           *
           * If Lazada has no variation name, fall back to TikTok.
           * This is useful for existing records.
           */
          variationName:
            product.variationNameLazada ?? product.variationNameTiktok ?? "",

          supplier: product.supplier,

          grams: product.gramRange ?? "",
          pricePerGram:
            product.pricePerGram === null ? null : Number(product.pricePerGram),
          sellingPrice: Number(product.price),

          stock: product.stock,

          // Shopee
          variationNameShopee: product.variationNameShopee,
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
      setDeletedVariantIds([]);
    }
  }, [isOpen, isEditMode, productGroup]);

  const handleRowsChange = (updatedRows: VariantRow[]) => {
    const previousRowsById = new Map(rows.map((row) => [row.clientId, row]));

    const finalRows = updatedRows.map((row) => {
      const previousRow = previousRowsById.get(row.clientId);

      // Only apply this behavior to a NEW variant
      // being added while editing an existing product.
      if (
        isEditMode &&
        row.id === null &&
        previousRow &&
        row.variationName !== previousRow.variationName &&
        row.variationNameTiktok === previousRow.variationNameTiktok
      ) {
        return {
          ...row,
          variationNameTiktok: row.variationName,
        };
      }

      return row;
    });

    setRows(finalRows);
  };

  const handleAddVariant = () => {
    const newVariant: VariantRow = {
      ...createVariant(),

      // New variant inside an existing product:
      // TikTok will follow whatever the user enters
      // in the main Variation Name field.
      variationNameTiktok: "",
    };

    setRows((previous) => [...previous, newVariant]);

    setSelectedVariantClientId(newVariant.clientId);
  };

  const handleRemoveVariant = () => {
    if (!selectedVariantClientId) {
      alert("Please select a variant first.");
      return;
    }

    if (rows.length <= 1) {
      alert("A product must have at least one variant.");
      return;
    }

    const rowToDelete = rows.find(
      (row) => row.clientId === selectedVariantClientId
    );

    if (!rowToDelete) return;

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

          variationNameShopee: null,
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

        variationNameShopee: null,
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

    /*
     * For NEW products:
     *
     * User input:
     *   variationName
     *
     * becomes according to the backend's
     * new-product initialization rules:
     *
     *   Shopee  -> null for a single variant
     *   Lazada  -> user input
     *   TikTok  -> "Default" for a single variant
     *
     * For EDITING an existing product:
     *
     * Existing rows are updated using their exact
     * marketplace values.
     *
     * Newly added variants to an existing product
     * also send their marketplace values explicitly,
     * so they do NOT receive the new-product "Default"
     * rule.
     */

    const payload = {
      productName,
      category,

      rows: rows.map((row) => ({
        variationName: row.variationName,
        supplier: row.supplier,
        grams: row.grams,
        pricePerGram:
          row.pricePerGram == null ? null : Number(row.pricePerGram),
        sellingPrice: row.sellingPrice ?? 0,
        stock: row.stock,
      })),
    };

    try {
      if (isEditMode) {
        // Delete variants that were removed from the modal
        await Promise.all(deletedVariantIds.map((id) => deleteProduct(id)));

        await Promise.all(
          rows.map((row) => {
            const productPayload = {
              productName,
              masterCategory: category,

              supplier: row.supplier,

              gramRange: row.grams.trim() === "" ? undefined : row.grams,

              pricePerGram: row.pricePerGram ?? undefined,

              price: row.sellingPrice ?? 0,

              stock: row.stock,

              // --------------------------------
              // Shopee
              // --------------------------------
              variationNameShopee: row.variationNameShopee,

              productIdShopee: row.productIdShopee,

              variationIdShopee: row.variationIdShopee,

              // --------------------------------
              // Lazada
              // --------------------------------
              variationNameLazada: row.variationNameLazada,

              productIdLazada: row.productIdLazada,

              skuIdLazada: row.skuIdLazada,

              keyLazada: row.keyLazada,

              quantityLazada: row.quantityLazada,

              // --------------------------------
              // TikTok
              // --------------------------------
              variationNameTiktok: row.variationNameTiktok,

              productIdTiktok: row.productIdTiktok,

              skuIdTiktok: row.skuIdTiktok,

              categoryTiktok: row.categoryTiktok,

              quantityTiktok: row.quantityTiktok,
            };

            /*
             * Existing variant:
             *
             * Update it directly.
             */
            if (row.id !== null) {
              return updateProduct(row.id, productPayload);
            }

            /*
             * NEW VARIANT INSIDE AN EXISTING PRODUCT:
             *
             * IMPORTANT:
             *
             * We explicitly pass all marketplace variation names.
             * This prevents the backend from applying the
             * brand-new-product "TikTok = Default" rule.
             */
            return createProduct({
              productName,
              category,

              // IMPORTANT:
              // This is NOT a brand-new product.
              // This is a new variant being added to
              // an existing product.
              preserveMarketplaceValues: true,

              rows: [
                {
                  variationName: row.variationName,

                  supplier: row.supplier,

                  grams: row.grams,

                  pricePerGram:
                    row.pricePerGram == null ? null : Number(row.pricePerGram),

                  sellingPrice: row.sellingPrice ?? 0,

                  stock: row.stock,

                  variationNameShopee: row.variationNameShopee,

                  variationNameLazada: row.variationNameLazada,

                  variationNameTiktok: row.variationNameTiktok,
                },
              ],
            });
          })
        );

        setDeletedVariantIds([]);

        alert("Product updated successfully!");
      } else {
        /*
         * COMPLETELY NEW PRODUCT
         *
         * Do NOT pass marketplace variation names here.
         *
         * This allows the backend to apply the special
         * new-product initialization rules.
         */
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
              isEditMode={isEditMode}
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

            {isEditMode && (
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
            )}
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
