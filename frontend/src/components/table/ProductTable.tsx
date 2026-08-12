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
    headerName: "Variation Name Shopee",
    field: "variationNameShopee",
    flex: 1,
    minWidth: 180,
    editable: true,
  },
  {
    headerName: "Variation Name Lazada",
    field: "variationNameLazada",
    flex: 1,
    minWidth: 180,
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
  selectedFilter: string;
  loading: boolean;
  onSelectedProductChange: (product: Product | null) => void;
}

const ProductTable = ({
  products,
  loading,
  onSelectedProductChange,
}: ProductTableProps) => {
  const rowData = useMemo(() => {
    return products;
  }, [products]);

  const handleCellValueChanged = async (
    event: CellValueChangedEvent<Product>
  ) => {
    const field = event.colDef.field;

    const updatedData: Partial<Product> = {};

    if (field === "variationNameShopee") {
      updatedData.variationNameShopee = event.data.variationNameShopee;
    }

    if (field === "variationNameLazada") {
      updatedData.variationNameLazada = event.data.variationNameLazada;
    }

    if (field === "gramRange") {
      const gramRange = event.data.gramRange;

      updatedData.gramRange = gramRange;

      if (gramRange && event.data.pricePerGram != null) {
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
    }

    if (field === "pricePerGram") {
      const pricePerGram = event.data.pricePerGram;

      updatedData.pricePerGram = pricePerGram;

      if (pricePerGram != null && event.data.gramRange) {
        const newSellingPrice = calculateSellingPrice(
          event.data.gramRange,
          Number(pricePerGram)
        );

        if (newSellingPrice !== null) {
          updatedData.price = newSellingPrice;

          event.data.price = newSellingPrice;

          event.node.setDataValue("price", newSellingPrice);
        }
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
          rowData={rowData}
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
