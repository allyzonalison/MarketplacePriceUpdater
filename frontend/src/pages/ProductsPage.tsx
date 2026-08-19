import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar/Sidebar";
import Toolbar from "../components/layout/Header";
import ProductTable from "../components/table/ProductTable";
import ProductModal from "../components/modals/product/ProductModal";
import ConfirmModal from "../components/common/ConfirmModal";

import { getProducts, deleteProduct } from "../services/productService";

import type { Product } from "../types/product";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [isEditMode, setIsEditMode] = useState(false);

  const [loading, setLoading] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const selectedProduct =
    selectedProducts.length === 1 ? selectedProducts[0] : null;

  const selectedProductGroup = selectedProduct
    ? products.filter((p) => p.productName === selectedProduct.productName)
    : [];

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const refreshProducts = async (
    search = searchText,
    filter = selectedFilter
  ) => {
    try {
      setLoading(true);

      const data = await getProducts(search, filter);

      setProducts(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(JSON.stringify(error));
      }
    } finally {
      setLoading(false);
    }
  };

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshProducts(searchText, selectedFilter);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  // Dropdown filter
  useEffect(() => {
    void refreshProducts(searchText, selectedFilter);
  }, [selectedFilter]);

  const handlePreview = (previewProducts: Product[]) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const preview = previewProducts.find((p) => p.id === product.id);

        if (!preview) {
          return product;
        }

        return {
          ...product,
          price: preview.price,
          pricePerGram: preview.pricePerGram,
        };
      })
    );
  };

  const handleDeleteProduct = async () => {
    if (selectedProducts.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map((product) => deleteProduct(product.id))
      );

      await refreshProducts(searchText, selectedFilter);

      setSelectedProducts([]);

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);

      alert("Failed to delete selected products.");
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          onPreview={handlePreview}
          onApplySuccess={async () => {
            await refreshProducts(searchText, selectedFilter);
          }}
        />

        <main className="flex flex-1 flex-col overflow-hidden p-6">
          <Toolbar
            searchText={searchText}
            onSearchTextChange={setSearchText}
            selectedFilter={selectedFilter}
            onSelectedFilterChange={setSelectedFilter}
            onAddProduct={() => {
              setIsEditMode(false);
              setIsProductModalOpen(true);
            }}
            onEditProduct={() => {
              if (!selectedProduct) {
                return;
              }

              setIsEditMode(true);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={() => {
              if (selectedProducts.length === 0) {
                return;
              }

              setIsDeleteModalOpen(true);
            }}
            addDisabled={selectedProducts.length > 1}
            editDisabled={selectedProducts.length !== 1}
            deleteDisabled={selectedProducts.length === 0}
          />

          <div className="mt-6 flex-1 overflow-hidden">
            <ProductTable
              products={products}
              searchText={searchText}
              selectedFilter={selectedFilter}
              loading={loading}
              onSelectedProductsChange={setSelectedProducts}
            />
          </div>
        </main>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        isEditMode={isEditMode}
        productGroup={selectedProductGroup}
        onClose={() => setIsProductModalOpen(false)}
        onSaveSuccess={async () => {
          await refreshProducts(searchText, selectedFilter);
        }}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={
          selectedProducts.length > 1
            ? `Delete ${selectedProducts.length} Products`
            : "Delete Product"
        }
        description={
          selectedProducts.length > 1
            ? "Are you sure you want to delete all selected products? This action cannot be undone."
            : "Are you sure you want to delete this product? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={handleDeleteProduct}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-100 p-4">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="border-b border-gray-200 py-2 last:border-b-0"
            >
              <p className="font-semibold">{product.productName}</p>

              <p className="mt-1 text-sm text-gray-500">
                Variation: {product.variationNameShopee ?? "NULL"}
              </p>
            </div>
          ))}
        </div>
      </ConfirmModal>
    </>
  );
};

export default ProductsPage;
