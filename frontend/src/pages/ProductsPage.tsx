import Sidebar from "../components/sidebar/Sidebar";
import Toolbar from "../components/layout/Header";
import ProductTable from "../components/table/ProductTable";

const ProductsPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <Toolbar />

        <div className="mt-6">
          <ProductTable />
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
