import { useAtomValue, useSetAtom } from "jotai";
import { type FC, type ReactNode, useCallback, useMemo, useState } from "react";
import {
  activeSheetIdAtom,
  allSheetTemplatesAtom,
  applyColumnBindingAtom,
  type ColumnConfig,
  type ColumnId,
  columnConfigsAtom,
  columnNamesAtom,
  type PulldownMode,
  referencedSheetsDataAtom,
} from "../stores";
import type {
  CandidateColumn,
  CandidateSheet,
  ColumnSettingModalPresenterProps,
  LookupColumnItem,
} from "./ColumnSettingModal.presenter";

export type ColumnSettingModalContainerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetColId: ColumnId;
  children: (props: ColumnSettingModalPresenterProps) => ReactNode;
};

export const ColumnSettingModalContainer: FC<
  ColumnSettingModalContainerProps
> = ({ open, onOpenChange, targetColId, children }) => {
  const activeSheetId = useAtomValue(activeSheetIdAtom);
  const allTemplates = useAtomValue(allSheetTemplatesAtom);
  const columnNames = useAtomValue(columnNamesAtom);
  const columnConfigs = useAtomValue(columnConfigsAtom);
  const referencedSheets = useAtomValue(referencedSheetsDataAtom);
  const setReferencedSheets = useSetAtom(referencedSheetsDataAtom);
  const applyBinding = useSetAtom(applyColumnBindingAtom);

  const existingConfig: ColumnConfig | undefined = activeSheetId
    ? columnConfigs[activeSheetId]?.[targetColId]
    : undefined;

  const candidateSheets: CandidateSheet[] = useMemo(() => {
    return allTemplates
      .filter((s) => s.id !== activeSheetId)
      .map((s) => ({
        id: s.id,
        name: s.name,
      }));
  }, [allTemplates, activeSheetId]);

  const defaultSheetId = useMemo(() => {
    return candidateSheets[0]?.id ?? "";
  }, [candidateSheets]);

  // Initial source sheet ID
  const initialSourceSheetId = useMemo(() => {
    if (existingConfig && existingConfig.type === "pulldown") {
      return existingConfig.pulldown.sourceSheetId;
    }
    return defaultSheetId;
  }, [existingConfig, defaultSheetId]);

  const [sourceSheetId, setSourceSheetId] =
    useState<string>(initialSourceSheetId);

  const sourceSheetData = useMemo(() => {
    if (!sourceSheetId) return null;
    return referencedSheets[sourceSheetId] ?? null;
  }, [sourceSheetId, referencedSheets]);

  const candidateColumns: CandidateColumn[] = useMemo(() => {
    if (!sourceSheetData) return [];
    return sourceSheetData.cols.map((colId: ColumnId, index: number) => ({
      id: colId,
      name: sourceSheetData.colNames[colId] ?? `列 ${index + 1}`,
    }));
  }, [sourceSheetData]);

  // Initial source key column
  const [sourceKeyColId, setSourceKeyColId] = useState<ColumnId | "">(() => {
    if (existingConfig && existingConfig.type === "pulldown") {
      return existingConfig.pulldown.sourceKeyColId;
    }
    const initialSheet = referencedSheets[initialSourceSheetId];
    const firstCol = initialSheet?.cols[0];
    return firstCol ?? "";
  });

  // Initial key column display name
  const [keyColName, setKeyColName] = useState<string>(() => {
    return columnNames[targetColId] ?? "";
  });

  // Initial lookup columns selection
  const [selectedLookupCols, setSelectedLookupCols] = useState<
    Record<ColumnId, { selected: boolean; headerName: string }>
  >(() => {
    if (existingConfig && existingConfig.type === "pulldown") {
      const lookups: Record<
        ColumnId,
        { selected: boolean; headerName: string }
      > = {};
      for (const l of existingConfig.pulldown.lookupColumns) {
        lookups[l.sourceColId] = {
          selected: true,
          headerName: l.sourceColName ?? columnNames[l.lookupColId] ?? "",
        };
      }
      return lookups;
    }

    const initialSheet = referencedSheets[initialSourceSheetId];
    const initialLookups: Record<
      ColumnId,
      { selected: boolean; headerName: string }
    > = {};
    if (initialSheet && initialSheet.cols.length > 1) {
      for (let i = 1; i < initialSheet.cols.length; i++) {
        const colId = initialSheet.cols[i];
        if (colId) {
          initialLookups[colId] = {
            selected: true,
            headerName: initialSheet.colNames[colId] ?? `列 ${i + 1}`,
          };
        }
      }
    }
    return initialLookups;
  });

  // Initial mode
  const [mode, setMode] = useState<PulldownMode>(() => {
    if (existingConfig && existingConfig.type === "pulldown") {
      return existingConfig.pulldown.mode;
    }
    return "dropdown";
  });

  // When sourceSheetId changes via user selection in the dropdown
  const handleSheetChange = useCallback(
    (newSheetId: string) => {
      setSourceSheetId(newSheetId);
      const sheetData = referencedSheets[newSheetId];
      if (!sheetData) {
        setSourceKeyColId("");
        setSelectedLookupCols({});
        return;
      }
      const cols = sheetData.cols;
      if (cols.length > 0) {
        const firstCol = cols[0];
        if (firstCol) {
          setSourceKeyColId(firstCol);
        }
        const newLookups: Record<
          ColumnId,
          { selected: boolean; headerName: string }
        > = {};
        for (let i = 1; i < cols.length; i++) {
          const colId = cols[i];
          if (colId) {
            newLookups[colId] = {
              selected: true,
              headerName: sheetData.colNames[colId] ?? `列 ${i + 1}`,
            };
          }
        }
        setSelectedLookupCols(newLookups);
      } else {
        setSourceKeyColId("");
        setSelectedLookupCols({});
      }
    },
    [referencedSheets],
  );

  const handleKeyColChange = useCallback((newKeyColId: ColumnId) => {
    setSourceKeyColId(newKeyColId);
    setSelectedLookupCols((prev) => {
      const next = { ...prev };
      delete next[newKeyColId];
      return next;
    });
  }, []);

  const handleToggleLookupCol = useCallback(
    (colId: ColumnId, selected: boolean) => {
      setSelectedLookupCols((prev) => {
        const colDef = candidateColumns.find((c) => c.id === colId);
        return {
          ...prev,
          [colId]: {
            selected,
            headerName: prev[colId]?.headerName || colDef?.name || "",
          },
        };
      });
    },
    [candidateColumns],
  );

  const handleLookupColNameChange = useCallback(
    (colId: ColumnId, name: string) => {
      setSelectedLookupCols((prev) => ({
        ...prev,
        [colId]: {
          selected: prev[colId]?.selected ?? true,
          headerName: name,
        },
      }));
    },
    [],
  );

  const lookupColumns: LookupColumnItem[] = useMemo(() => {
    return candidateColumns
      .filter((c) => c.id !== sourceKeyColId)
      .map((c) => ({
        colId: c.id,
        name: c.name,
        selected: selectedLookupCols[c.id]?.selected ?? false,
        headerName: selectedLookupCols[c.id]?.headerName ?? c.name,
      }));
  }, [candidateColumns, sourceKeyColId, selectedLookupCols]);

  const handleSave = useCallback(() => {
    if (!targetColId || !sourceKeyColId || !sourceSheetId) return;

    if (sourceSheetData) {
      setReferencedSheets((prev) => ({
        ...prev,
        [sourceSheetId]: sourceSheetData,
      }));
    }

    const selectedLookupItems = lookupColumns
      .filter((c) => c.selected)
      .map((c) => ({
        sourceColId: c.colId,
        headerName: c.headerName || c.name,
      }));

    applyBinding({
      targetColId,
      sourceSheetId,
      sourceKeyColId,
      keyColName: keyColName || undefined,
      selectedLookupCols: selectedLookupItems,
      mode,
    });

    onOpenChange(false);
  }, [
    targetColId,
    sourceKeyColId,
    sourceSheetId,
    sourceSheetData,
    setReferencedSheets,
    lookupColumns,
    applyBinding,
    keyColName,
    mode,
    onOpenChange,
  ]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <>
      {children({
        open,
        onOpenChange,
        candidateSheets,
        selectedSheetId: sourceSheetId,
        onSelectSheet: handleSheetChange,
        candidateColumns,
        selectedKeyColId: sourceKeyColId,
        onSelectKeyCol: handleKeyColChange,
        keyColName,
        onChangeKeyColName: setKeyColName,
        lookupColumns,
        onToggleLookupCol: handleToggleLookupCol,
        onChangeLookupColName: handleLookupColNameChange,
        mode,
        onChangeMode: setMode,
        onSave: handleSave,
        onCancel: handleCancel,
      })}
    </>
  );
};
