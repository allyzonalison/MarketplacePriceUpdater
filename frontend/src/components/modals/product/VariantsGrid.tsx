import { AgGridReact } from "ag-grid-react";
import { calculateSellingPrice } from "./PriceCalculator";
import {
  AllCommunityModule,
  ModuleRegistry,
  type CellValueChangedEvent,
  type ColDef,
  type RowSelectedEvent,
} from "ag-grid-community";

import {
  isValidWeightRange,
  isPositiveNumber,
  isWholeNumber,
} from "./ProductValidation";

import "ag-grid-community/styles/ag-theme-alpine.css";

import type { VariantRow } from "../../../types/variant";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  isEditMode: boolean;

  rows: VariantRow[];
  onRowsChange: (rows: VariantRow[]) => void;
  onSelectedRowChange: (clientId: string | null) => void;
}

const VariantsGrid = ({
  isEditMode,
  rows,
  onRowsChange,
  onSelectedRowChange,
}: Props) => {
  const columnDefs: ColDef<VariantRow>[] = isEditMode
    ? [
        {
          checkboxSelection: true,
          headerCheckboxSelection: false,
          width: 55,
          editable: false,
          pinned: "left",
        },

        {
          headerName: "Variation",
          field: "variationName",
          width: 150,
        },
        {
          headerName: "Supplier",
          field: "supplier",
          width: 120,
        },
        {
          headerName: "Grams",
          field: "grams",
          width: 120,
          editable: true,
          cellStyle: (params) =>
            isValidWeightRange(params.value)
              ? null
              : { backgroundColor: "#FEE2E2" },
        },
        {
          headerName: "Price / Gram",
          field: "pricePerGram",
          width: 130,
          editable: true,
          cellStyle: (params) =>
            isPositiveNumber(params.value)
              ? null
              : { backgroundColor: "#FEE2E2" },
        },
        {
          headerName: "Selling Price",
          field: "sellingPrice",
          width: 130,
          editable: false,
        },
        {
          headerName: "Stock",
          field: "stock",
          width: 100,
          editable: true,
          cellStyle: (params) =>
            isWholeNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
        },

        {
          headerName: "Shopee Product ID",
          field: "productIdShopee",
          width: 180,
        },
        {
          headerName: "Shopee Variation ID",
          field: "variationIdShopee",
          width: 180,
        },

        {
          headerName: "Lazada Product ID",
          field: "productIdLazada",
          width: 180,
        },
        {
          headerName: "Lazada SKU ID",
          field: "skuIdLazada",
          width: 180,
        },
        {
          headerName: "Lazada Key",
          field: "keyLazada",
          width: 180,
        },
        {
          headerName: "Lazada Qty",
          field: "quantityLazada",
          width: 120,
          valueParser: (params) => {
            if (params.newValue === "") return null;
            return Number(params.newValue);
          },
        },
        {
          headerName: "Lazada Variation",
          field: "variationNameLazada",
          width: 180,
        },

        {
          headerName: "TikTok Product ID",
          field: "productIdTiktok",
          width: 180,
        },
        {
          headerName: "TikTok SKU ID",
          field: "skuIdTiktok",
          width: 180,
        },
        {
          headerName: "TikTok Category",
          field: "categoryTiktok",
          width: 180,
        },
        {
          headerName: "TikTok Qty",
          field: "quantityTiktok",
          width: 120,
          valueParser: (params) => {
            if (params.newValue === "") return null;
            return Number(params.newValue);
          },
        },
        {
          headerName: "TikTok Variation",
          field: "variationNameTiktok",
          width: 180,
        },
      ]
    : [
        {
          checkboxSelection: true,
          headerCheckboxSelection: false,
          width: 55,
          editable: false,
          pinned: "left",
        },
        {
          headerName: "Variation",
          field: "variationName",
          flex: 1.5,
        },
        {
          headerName: "Supplier",
          field: "supplier",
          flex: 1,
        },
        {
          headerName: "Grams",
          field: "grams",
          flex: 1,
          editable: true,
          cellStyle: (params) =>
            isValidWeightRange(params.value)
              ? null
              : { backgroundColor: "#FEE2E2" },
        },
        {
          headerName: "Price / Gram",
          field: "pricePerGram",
          flex: 1,
          editable: true,
          cellStyle: (params) =>
            isPositiveNumber(params.value)
              ? null
              : { backgroundColor: "#FEE2E2" },
        },
        {
          headerName: "Selling Price",
          field: "sellingPrice",
          flex: 1,
          editable: false,
        },
        {
          headerName: "Stock",
          field: "stock",
          flex: 0.8,
          editable: true,
          cellStyle: (params) =>
            isWholeNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
        },
      ];

  const handleCellValueChanged = (event: CellValueChangedEvent<VariantRow>) => {
    const updatedRow: VariantRow = {
      ...event.data,
      sellingPrice: calculateSellingPrice(
        event.data.grams,
        event.data.pricePerGram
      ),
    };

    const updatedRows = rows.map((row) =>
      row.clientId === updatedRow.clientId ? updatedRow : row
    );

    onRowsChange(updatedRows);
  };

  const handleRowSelected = (event: RowSelectedEvent<VariantRow>) => {
    if (!event.node.isSelected()) {
      onSelectedRowChange(null);
      return;
    }

    onSelectedRowChange(event.data?.clientId ?? null);
  };

  return (
    <div
      className="ag-theme-alpine mt-4"
      style={{
        height: 350,
        width: "100%",
        overflowX: isEditMode ? "auto" : "hidden",
      }}
    >
      <AgGridReact<VariantRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection="single"
        onRowSelected={handleRowSelected}
        onCellValueChanged={handleCellValueChanged}
        getRowId={(params) => params.data.clientId}
        defaultColDef={{
          editable: true,
          resizable: true,
          sortable: true,
          filter: true,
          minWidth: 120,
        }}
      />
    </div>
  );
};

export default VariantsGrid;
