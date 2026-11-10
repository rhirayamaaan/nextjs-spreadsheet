import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  type FC,
  type MouseEvent,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useAsyncCellValidation } from "../logics/useAsyncCellValidation";
import {
  activeCellAtom,
  activeColumnConfigFamily,
  activeSheetModeAtom,
  baseCellValuesAtom,
  type ColumnConfig,
  type ColumnId,
  cellEditingInitialValueFamily,
  cellEditsAtom,
  cellFamily,
  cellStatusFamily,
  columnOrderAtom,
  isCellEditingFamily,
  isSubtotalRowId,
  type MoveDirection,
  moveSelectionAtom,
  type RowId,
  referencedSheetsDataAtom,
  selectionAtom,
  visibleRowOrderAtom,
  workbookStatusAtom,
} from "../stores";
import type { CellPresenterProps } from "./Cell.presenter";

const blurActiveElement = (currentTarget: EventTarget | null) => {
  if (typeof document === "undefined") return;
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || active === currentTarget) return;
  active.blur();
};

type Option = {
  key: string;
  label: string;
};

/**
 * プルダウン編集時のみ master 参照・セル編集値を購読して選択肢を計算する独立コンポーネント。
 * 通常表示中のセルが cellEditsAtom / baseCellValuesAtom の更新で無駄に再レンダリングされるのを完全に防ぐ。
 */
const PulldownOptionsFetcher: FC<{
  rowId: RowId;
  config: ColumnConfig & { type: "pulldown" };
  children: (options: Option[]) => ReactNode;
}> = ({ rowId, config, children }) => {
  const referencedSheets = useAtomValue(referencedSheetsDataAtom);
  const cellEdits = useAtomValue(cellEditsAtom);
  const baseCellValues = useAtomValue(baseCellValuesAtom);

  const pulldownOptions = useMemo(() => {
    const { sourceSheetId, sourceKeyColId, lookupColumns, relation } =
      config.pulldown;
    const targetMasterId = relation?.targetSheetId ?? sourceSheetId;
    const masterSheet = referencedSheets[targetMasterId];
    if (!masterSheet) return [];

    const candidateRows = (() => {
      if (!relation) return masterSheet.rows;

      const parentKey = `${rowId}-${relation.parentColId}`;
      const parentVal =
        parentKey in cellEdits
          ? cellEdits[parentKey]
          : (baseCellValues[parentKey] ?? "");

      if (!parentVal) return [];

      return masterSheet.rows.filter((rId) => {
        const fKey = `${rId}-${relation.sourceFilterColId}`;
        const fVal =
          fKey in cellEdits
            ? cellEdits[fKey]
            : (masterSheet.values[fKey] ?? "");
        return fVal === parentVal;
      });
    })();

    return candidateRows.map((rId) => {
      const key = `${rId}-${sourceKeyColId}`;
      const keyVal =
        key in cellEdits ? cellEdits[key] : (masterSheet.values[key] ?? "");
      const labels = lookupColumns
        .map((l) => {
          const lKey = `${rId}-${l.sourceColId}`;
          return lKey in cellEdits
            ? cellEdits[lKey]
            : (masterSheet.values[lKey] ?? "");
        })
        .filter(Boolean)
        .join(" - ");

      return {
        key: keyVal,
        label: labels ? `${keyVal} (${labels})` : keyVal,
      };
    });
  }, [config, referencedSheets, cellEdits, rowId, baseCellValues]);

  return <>{children(pulldownOptions)}</>;
};

type InnerProps = {
  row: number;
  col: number;
  rowId: RowId;
  colId: ColumnId;
  onFinishEditing?: () => void;
  children: (props: CellPresenterProps) => ReactNode;
};

const CellInner: FC<InnerProps> = memo(
  ({ row, col, rowId, colId, onFinishEditing, children }) => {
    const [value, setValue] = useAtom(
      useMemo(() => cellFamily({ rowId, colId }), [rowId, colId]),
    );
    const cellStatusInfo = useAtomValue(
      useMemo(() => cellStatusFamily({ rowId, colId }), [rowId, colId]),
    );
    const isEditing = useAtomValue(
      useMemo(() => isCellEditingFamily({ row, col }), [row, col]),
    );
    const editingInitialValue = useAtomValue(
      useMemo(() => cellEditingInitialValueFamily({ row, col }), [row, col]),
    );
    const setEditingCell = useSetAtom(activeCellAtom);
    const moveSelection = useSetAtom(moveSelectionAtom);
    const setWorkbookStatus = useSetAtom(workbookStatusAtom);
    const setSelection = useSetAtom(selectionAtom);

    const config = useAtomValue(
      useMemo(() => activeColumnConfigFamily(colId), [colId]),
    );
    const sheetMode = useAtomValue(activeSheetModeAtom);

    const isSubtotal = isSubtotalRowId(rowId);
    const isLookup = config.type === "lookup";
    const isReadOnly =
      Boolean(config.readOnly) || sheetMode === "inquiry" || isSubtotal;
    const isPulldown = config.type === "pulldown";
    const isDatetimePicker = config.type === "datetime";
    const datetimeFormat = isDatetimePicker ? config.format : undefined;
    const pulldownMode = isPulldown ? config.pulldown.mode : undefined;

    const { validateCellAsync } = useAsyncCellValidation();

    const handleDoubleClick = useCallback(() => {
      if (isLookup || isReadOnly || isSubtotal) return;
      setEditingCell({ row, col });
    }, [isLookup, isReadOnly, isSubtotal, row, col, setEditingCell]);

    const handleCommit = useCallback(
      (newVal: string, move?: MoveDirection) => {
        if (newVal !== value) {
          setValue(newVal);
          validateCellAsync({ rowId, colId, newValue: newVal });
        }
        setEditingCell(null);
        if (move) {
          moveSelection({ ...move, extend: false });
          queueMicrotask(() => {
            onFinishEditing?.();
          });
        }
      },
      [
        value,
        setValue,
        setEditingCell,
        moveSelection,
        onFinishEditing,
        validateCellAsync,
        rowId,
        colId,
      ],
    );

    const handleCancel = useCallback(() => {
      setEditingCell(null);
      queueMicrotask(() => {
        onFinishEditing?.();
      });
    }, [setEditingCell, onFinishEditing]);

    const handleSelectionStart = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        if (isEditing) return;

        // セルボタンへのフォーカス移動・ブラウザテキスト選択を阻止し、シートコンテナへのフォーカスを維持
        event.preventDefault();

        blurActiveElement(event.currentTarget);
        setEditingCell(null);

        setWorkbookStatus("selecting");
        setSelection((prev) => ({
          start: event.shiftKey && prev ? prev.start : { row, col },
          end: { row, col },
        }));
        onFinishEditing?.();
      },
      [
        setSelection,
        setWorkbookStatus,
        setEditingCell,
        isEditing,
        row,
        col,
        onFinishEditing,
      ],
    );

    const handleSelectionMove = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (event.buttons !== 1) return;
        setSelection((prev) => {
          if (!prev) {
            return {
              start: { row, col },
              end: { row, col },
            };
          }
          return {
            start: prev.start,
            end: { row, col },
          };
        });
      },
      [setSelection, row, col],
    );

    const renderPresenter = useCallback(
      (options?: Option[]) =>
        children({
          value,
          editingInitialValue,
          status: isEditing ? "none" : cellStatusInfo.status,
          statusMessage: isEditing ? undefined : cellStatusInfo.message,
          errorInfo: isEditing ? undefined : cellStatusInfo.errorInfo,
          isEditing,
          isLookup,
          isReadOnly,
          isSubtotal,
          isPulldown,
          isDatetime: isDatetimePicker,
          datetimeFormat,
          pulldownMode,
          pulldownOptions: options,
          onCommit: handleCommit,
          onCancel: handleCancel,
          onDoubleClick: handleDoubleClick,
          onMouseDown: handleSelectionStart,
          onMouseEnter: handleSelectionMove,
        }),
      [
        children,
        value,
        editingInitialValue,
        isEditing,
        cellStatusInfo,
        isLookup,
        isReadOnly,
        isSubtotal,
        isPulldown,
        isDatetimePicker,
        datetimeFormat,
        pulldownMode,
        handleCommit,
        handleCancel,
        handleDoubleClick,
        handleSelectionStart,
        handleSelectionMove,
      ],
    );

    if (isEditing && isPulldown && config.type === "pulldown") {
      return (
        <PulldownOptionsFetcher rowId={rowId} config={config}>
          {renderPresenter}
        </PulldownOptionsFetcher>
      );
    }

    return <>{renderPresenter()}</>;
  },
);

CellInner.displayName = "CellInner";

type Props = {
  row: number;
  col: number;
  rowId?: RowId;
  colId?: ColumnId;
  onFinishEditing?: () => void;
  children: (props: CellPresenterProps) => ReactNode;
};

export const CellContainer: FC<Props> = memo(
  ({
    row,
    col,
    rowId: propRowId,
    colId: propColId,
    onFinishEditing,
    children,
  }) => {
    const visibleRowOrder = useAtomValue(visibleRowOrderAtom);
    const columnOrder = useAtomValue(columnOrderAtom);
    const rowId = propRowId ?? visibleRowOrder[row];
    const colId = propColId ?? columnOrder[col];

    if (!rowId || !colId) {
      return null;
    }

    return (
      <CellInner
        rowId={rowId}
        colId={colId}
        row={row}
        col={col}
        onFinishEditing={onFinishEditing}
      >
        {children}
      </CellInner>
    );
  },
);

CellContainer.displayName = "CellContainer";
