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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const selectedProductGroup = selectedProduct
    ? products.filter((p) => p.productName === selectedProduct.productName)
    : [];

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const refreshProducts = async (search = searchText) => {
    try {
      setLoading(true);

      const data = await getProducts(search);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshProducts(searchText);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

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
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);

      await refreshProducts();

      setSelectedProduct(null);

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to delete product.");
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar onPreview={handlePreview} onApplySuccess={refreshProducts} />

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
                alert("Please select a product first.");
                return;
              }

              setIsEditMode(true);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={() => {
              if (!selectedProduct) {
                alert("Please select a product first.");
                return;
              }

              setIsDeleteModalOpen(true);
            }}
          />

          <div className="mt-6 flex-1 overflow-hidden">
            <ProductTable
              products={products}
              searchText={searchText}
              selectedFilter={selectedFilter}
              loading={loading}
              onSelectedProductChange={setSelectedProduct}
            />
          </div>
        </main>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        isEditMode={isEditMode}
        productGroup={selectedProductGroup}
        onClose={() => setIsProductModalOpen(false)}
        onSaveSuccess={refreshProducts}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={handleDeleteProduct}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="font-semibold">{selectedProduct?.productName}</p>

          <p className="mt-1 text-sm text-gray-500">
            Variation: {selectedProduct?.variationNameShopee}
          </p>
        </div>
      </ConfirmModal>
    </>
  );
};

export default ProductsPage;
