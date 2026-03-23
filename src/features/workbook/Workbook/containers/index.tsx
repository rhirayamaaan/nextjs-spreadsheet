"use client";

import { useAtom, useSetAtom } from "jotai";
import { type FC, useCallback, useEffect } from "react";
import { useExportExcel } from "../../hooks/useExportExcel";
import { useExportPdf } from "../../hooks/useExportPdf";
import { PdfPreviewContainer } from "../../PdfPreview/containers";
import { SheetContainer } from "../../Sheet/containers";
import {
  activeSheetIdAtom,
  baseCellValuesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
  type ColumnId,
  createColumnId,
  createRowId,
  type RowId,
  viewModeAtom,
} from "../../stores";
import { WorkbookPresenter } from "../components";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";

export const MOCK_SHEETS = Array.from({ length: 20 }, (_, i) => {
  const sheetIndex = i + 1;
  if (sheetIndex === 1) {
    return {
      id: "sheet-1",
      name: "シート 1",
      rowCount: 10000,
      colCount: 30,
    };
  }
  return {
    id: `sheet-${sheetIndex}`,
    name: `シート ${sheetIndex}`,
    // Static counts: rows between 1000-10000, cols between 10-50 based on index
    rowCount: 1000 + ((sheetIndex * 450) % 9001),
    colCount: 10 + ((sheetIndex * 2) % 41),
  };
});

// Stable mock data cache to ensure RowIds/ColumnIds don't change on tab switch
const sheetDataCache: Record<
  string,
  { rows: RowId[]; cols: ColumnId[]; values: Record<string, string> }
> = {};

export const WorkbookContainer: FC = () => {
  const { exportCurrentSheet } = useExportExcel();
  const { previewCurrentSheetPdf, isExporting: isExportingPdf } =
    useExportPdf();
  const [activeSheetId, setActiveSheetId] = useAtom(activeSheetIdAtom);
  const setBaseRowOrder = useSetAtom(baseRowOrderAtom);
  const setBaseColumnOrder = useSetAtom(baseColumnOrderAtom);
  const setBaseValues = useSetAtom(baseCellValuesAtom);

  const [viewMode] = useAtom(viewModeAtom);

  const loadSheetData = useCallback(
    (sheetId: string) => {
      if (!sheetDataCache[sheetId]) {
        const sheet = MOCK_SHEETS.find((s) => s.id === sheetId);
        if (!sheet) return;

        const sheetIndex = MOCK_SHEETS.indexOf(sheet);
        const { rowCount, colCount } = sheet;

        const rows = Array.from({ length: rowCount }, () => createRowId());
        const cols = Array.from({ length: colCount }, () => createColumnId());
        const initialValues: Record<string, string> = {};

        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < cols.length; c++) {
            initialValues[`${rows[r]}-${cols[c]}`] =
              `${sheetIndex + 1}-${c + 1}:${r + 1}`;
          }
        }
        sheetDataCache[sheetId] = { rows, cols, values: initialValues };
      }

      const { rows, cols, values } = sheetDataCache[sheetId];
      setBaseValues(values);
      setBaseRowOrder(rows);
      setBaseColumnOrder(cols);
      setActiveSheetId(sheetId);
    },
    [setBaseValues, setBaseRowOrder, setBaseColumnOrder, setActiveSheetId],
  );

  useEffect(() => {
    if (!activeSheetId) {
      loadSheetData(MOCK_SHEETS[0].id);
    }
  }, [activeSheetId, loadSheetData]);

  const handleSelectSheet = useCallback(
    (id: string) => {
      loadSheetData(id);
    },
    [loadSheetData],
  );

  const activeSheet = MOCK_SHEETS.find((s) => s.id === activeSheetId);

  if (viewMode === "pdf-preview") {
    return <PdfPreviewContainer />;
  }

  return (
    <WorkbookPresenter
      toolbar={
        <Toolbar
          sheetName={activeSheet?.name}
          onExport={exportCurrentSheet}
          onPreviewPdf={previewCurrentSheetPdf}
          isExportingPdf={isExportingPdf}
        />
      }
      tabs={
        <SheetTabs
          activeSheetId={activeSheetId}
          sheets={MOCK_SHEETS}
          onSelectSheet={handleSelectSheet}
        />
      }
      sheet={<SheetContainer />}
    />
  );
};
