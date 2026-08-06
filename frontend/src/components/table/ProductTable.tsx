import { matchesFilter } from "../../utils/productFilters";
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type CellValueChangedEvent,
  type SelectionChangedEvent,
} from "ag-grid-community";

import "ag-grid-community/styles/ag-theme-alpine.css";

import { updateProduct } from "../../services/productService";
import { calculateSellingPrice } from "../modals/product/PriceCalculator";

import type { Product } from "../../types/product";

ModuleRegistry.registerModules([AllCommunityModule]);

const columnDefs: ColDef<Product>[] = [
  {
    headerName: "Product Name",
    field: "productName",
    flex: 4,
    minWidth: 350,
  },
  {
    headerName: "Category",
    field: "masterCategory",
    flex: 1,
  },
  {
    headerName: "Variation Name",
    field: "variationNameShopee",
    flex: 1,
    minWidth: 140,
    editable: true,
  },
  {
    headerName: "Gram Range",
    field: "gramRange",
    flex: 1,
    editable: true,
  },
  {
    headerName: "Supplier",
    field: "supplier",
    flex: 1,
  },
  {
    headerName: "Price / Gram",
    field: "pricePerGram",
    flex: 1,
    editable: true,
    valueFormatter: ({ value }) =>
      value != null ? `₱${Number(value).toLocaleString()}` : "",
  },
  {
    headerName: "Selling Price",
    field: "price",
    flex: 1,
    valueFormatter: ({ value }) =>
      value != null ? `₱${Number(value).toLocaleString()}` : "",
  },
  {
    headerName: "Stock",
    field: "stock",
    flex: 0.7,
  },
];

interface ProductTableProps {
  products: Product[];
  searchText: string;
  selectedFilter: string;
  loading: boolean;
  onSelectedProductChange: (product: Product | null) => void;
}

const ProductTable = ({
  products,
  searchText,
  selectedFilter,
  loading,
  onSelectedProductChange,
}: ProductTableProps) => {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchText.trim() === "" ||
        [
          product.productName,
          product.masterCategory,
          product.variationNameShopee,
          product.supplier,
          product.gramRange,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
          );

      const matchesCategory = matchesFilter(product, selectedFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedFilter]);

  const handleCellValueChanged = async (
    event: CellValueChangedEvent<Product>
  ) => {
    const field = event.colDef.field;

    const updatedData: Partial<Product> = {};

    if (field === "variationNameShopee") {
      updatedData.variationNameShopee = event.data.variationNameShopee;
    }

    if (field === "gramRange") {
      const gramRange = event.data.gramRange;

      updatedData.gramRange = gramRange;

      const newSellingPrice = calculateSellingPrice(
        gramRange,
        Number(event.data.pricePerGram)
      );

      if (newSellingPrice !== null) {
        updatedData.price = newSellingPrice;

        event.data.price = newSellingPrice;
        event.node.setDataValue("price", newSellingPrice);
      }
    }

    if (field === "pricePerGram") {
      const pricePerGram = Number(event.data.pricePerGram);

      updatedData.pricePerGram = pricePerGram;

      const newSellingPrice = calculateSellingPrice(
        event.data.gramRange,
        pricePerGram
      );

      if (newSellingPrice !== null) {
        updatedData.price = newSellingPrice;

        event.data.price = newSellingPrice;
        event.node.setDataValue("price", newSellingPrice);
      }
    }

    try {
      await updateProduct(event.data.id, updatedData);

      console.log("Saved!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectionChanged = (event: SelectionChangedEvent<Product>) => {
    const selected = event.api.getSelectedRows()[0] ?? null;
    onSelectedProductChange(selected);
  };

  return (
    <div className="h-full w-full">
      <div className="ag-theme-alpine h-full w-full overflow-hidden rounded-lg">
        <AgGridReact<Product>
          rowData={filteredProducts}
          columnDefs={columnDefs}
          loading={loading}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          rowSelection={{
            mode: "singleRow",
          }}
          animateRows
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
        />
      </div>
    </div>
  );
};

export default ProductTable;
