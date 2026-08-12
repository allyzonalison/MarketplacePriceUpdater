import { AgGridReact } from "ag-grid-react";
import { SUPPLIERS } from "../../../constants/suppliers";
import { calculateSellingPrice } from "./PriceCalculator";

import {
  AllCommunityModule,
  ModuleRegistry,
  type CellValueChangedEvent,
  type ColDef,
  type SelectionChangedEvent,
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
  const canEditSellingPrice = (row: VariantRow | undefined): boolean => {
    if (!row) {
      return false;
    }

    return (
      row.grams.trim() === "" ||
      row.pricePerGram === null ||
      row.pricePerGram <= 0
    );
  };

  const variationColumn: ColDef<VariantRow> = {
    headerName: "Variation Name",
    field: "variationName",
    width: 180,
    editable: true,
  };

  const commonEditableColumns: ColDef<VariantRow>[] = [
    {
      headerName: "Supplier",
      field: "supplier",
      width: 120,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: SUPPLIERS,
      },
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

      valueParser: (params) => {
        if (params.newValue === "") return null;
        return Number(params.newValue);
      },

      cellStyle: (params) =>
        isPositiveNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
    },
    {
      headerName: "Selling Price",
      field: "sellingPrice",
      width: 130,
      editable: (params) => canEditSellingPrice(params.data),

      valueParser: (params) => {
        if (params.newValue === "") return null;
        return Number(params.newValue);
      },
    },
    {
      headerName: "Stock",
      field: "stock",
      width: 100,
      editable: true,

      cellStyle: (params) =>
        isWholeNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
    },
  ];

  const marketplaceColumns: ColDef<VariantRow>[] = [
    // -------------------------
    // SHOPEE
    // -------------------------
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
      headerName: "Shopee Variation Name",
      field: "variationNameShopee",
      width: 180,
    },

    // -------------------------
    // LAZADA
    // -------------------------
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
      headerName: "Lazada Variation Name",
      field: "variationNameLazada",
      width: 180,
    },

    // -------------------------
    // TIKTOK
    // -------------------------
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
      headerName: "TikTok Variation Name",
      field: "variationNameTiktok",
      width: 180,
    },
  ];

  const columnDefs: ColDef<VariantRow>[] = isEditMode
    ? [
        {
          checkboxSelection: true,
          headerCheckboxSelection: false,
          width: 55,
          editable: false,
          pinned: "left",
        },

        variationColumn,

        ...commonEditableColumns,

        ...marketplaceColumns,
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
          ...variationColumn,
          flex: 1.5,
        },

        {
          ...commonEditableColumns[0],
          flex: 1,
        },
        {
          ...commonEditableColumns[1],
          flex: 1,
        },
        {
          ...commonEditableColumns[2],
          flex: 1,
        },
        {
          ...commonEditableColumns[3],
          flex: 1,
        },
        {
          ...commonEditableColumns[4],
          flex: 0.8,
        },
      ];

  const handleCellValueChanged = (event: CellValueChangedEvent<VariantRow>) => {
    const updatedRow: VariantRow = {
      ...event.data,

      pricePerGram: event.data.pricePerGram,
    };

    const hasFormula =
      updatedRow.grams.trim() !== "" &&
      updatedRow.pricePerGram !== null &&
      updatedRow.pricePerGram > 0;

    if (hasFormula) {
      updatedRow.sellingPrice = calculateSellingPrice(
        updatedRow.grams,
        updatedRow.pricePerGram
      );
    }

    const updatedRows = rows.map((row) =>
      row.clientId === updatedRow.clientId ? updatedRow : row
    );

    onRowsChange(updatedRows);
  };

  const handleSelectionChanged = (event: SelectionChangedEvent<VariantRow>) => {
    const selectedRows = event.api.getSelectedRows();

    const selectedRow = selectedRows[0];

    onSelectedRowChange(selectedRow?.clientId ?? null);
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
        onSelectionChanged={handleSelectionChanged}
        onCellValueChanged={handleCellValueChanged}
        getRowId={(params) => params.data.clientId}
      />
    </div>
  );
};

export default VariantsGrid;
