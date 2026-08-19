import { useState } from "react";
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
  const [bulkPricePerGram, setBulkPricePerGram] = useState("");

  // --------------------------------------------------
  // SELLING PRICE EDIT RULE
  // --------------------------------------------------

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

  // --------------------------------------------------
  // APPLY PRICE / GRAM TO ALL VARIANTS
  // --------------------------------------------------

  const handleApplyPriceToAll = () => {
    const price = Number(bulkPricePerGram);

    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid Price / Gram.");
      return;
    }

    const updatedRows = rows.map((row) => {
      const sellingPrice = calculateSellingPrice(row.grams, price);

      return {
        ...row,
        pricePerGram: price,
        sellingPrice: sellingPrice !== null ? sellingPrice : row.sellingPrice,
      };
    });

    onRowsChange(updatedRows);
  };

  // --------------------------------------------------
  // VARIATION COLUMN
  // --------------------------------------------------

  const variationColumn: ColDef<VariantRow> = {
    headerName: "Variation Name",
    field: "variationName",
    flex: 1,
    editable: true,
  };

  // --------------------------------------------------
  // COMMON EDITABLE COLUMNS
  // --------------------------------------------------

  const commonEditableColumns: ColDef<VariantRow>[] = [
    {
      headerName: "Supplier",
      field: "supplier",
      flex: 1,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: SUPPLIERS,
      },
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

      valueParser: (params) => {
        if (params.newValue === "") {
          return null;
        }

        return Number(params.newValue);
      },

      cellStyle: (params) =>
        isPositiveNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
    },

    {
      headerName: "Selling Price",
      field: "sellingPrice",
      flex: 1,

      editable: (params) => canEditSellingPrice(params.data),

      valueParser: (params) => {
        if (params.newValue === "") {
          return null;
        }

        return Number(params.newValue);
      },
    },

    {
      headerName: "Stock",
      field: "stock",
      flex: 1,
      editable: true,

      cellStyle: (params) =>
        isWholeNumber(params.value) ? null : { backgroundColor: "#FEE2E2" },
    },
  ];

  // --------------------------------------------------
  // MARKETPLACE VARIATION COLUMNS
  // --------------------------------------------------

  const editMarketplaceColumns: ColDef<VariantRow>[] = [
    {
      headerName: "Shopee Variation Name",
      field: "variationNameShopee",
      flex: 1,
      editable: true,
    },

    {
      headerName: "Lazada Variation Name",
      field: "variationNameLazada",
      flex: 1,
      editable: true,
    },

    {
      headerName: "TikTok Variation Name",
      field: "variationNameTiktok",
      flex: 1,
      editable: true,
    },
  ];

  // --------------------------------------------------
  // COLUMN DEFINITIONS
  // --------------------------------------------------

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

        ...editMarketplaceColumns,
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

  // --------------------------------------------------
  // CELL EDIT
  // --------------------------------------------------

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

  // --------------------------------------------------
  // ROW SELECTION
  // --------------------------------------------------

  const handleSelectionChanged = (event: SelectionChangedEvent<VariantRow>) => {
    const selectedRows = event.api.getSelectedRows();

    const selectedRow = selectedRows[0];

    onSelectedRowChange(selectedRow?.clientId ?? null);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="mt-4">
      {/* -------------------------------------------- */}
      {/* BULK PRICE CONTROL */}
      {/* -------------------------------------------- */}

      {isEditMode && (
        <div className="mb-3 flex items-center justify-end gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <label className="text-sm font-medium text-gray-700">
            Price / Gram:
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={bulkPricePerGram}
            onChange={(e) => setBulkPricePerGram(e.target.value)}
            placeholder="9000"
            className="w-28 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleApplyPriceToAll}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply to all variants
          </button>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* VARIANTS GRID */}
      {/* -------------------------------------------- */}

      <div
        className="ag-theme-alpine"
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
    </div>
  );
};

export default VariantsGrid;
