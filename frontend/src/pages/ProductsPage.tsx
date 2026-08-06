import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar/Sidebar";
import Toolbar from "../components/layout/Header";
import ProductTable from "../components/table/ProductTable";
import ProductModal from "../components/modals/product/ProductModal";

import { getProducts } from "../services/productService";

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

  const refreshProducts = async () => {
    try {
      const data = await getProducts();
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
    void refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(selectedProduct);
  }, [selectedProduct]);

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
              alert("Delete will be implemented next.");
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
    </>
  );
};

export default ProductsPage;
