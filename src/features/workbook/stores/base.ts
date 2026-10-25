import { atom } from "jotai";
import { sheetRecordsQuery } from "../services/sheetRecords/sheetRecords.query";
import { workbookMetadataQuery } from "../services/workbookMetadata/workbookMetadata.query";
import {
  type ColumnId,
  createRecordRowId,
  type RowId,
  type SheetData,
  type SheetTemplate,
} from "./types";
import { activeSheetIdAtom } from "./ui";

/**
 * 該当シートの SheetData をオンデマンド構築する純粋ヘルパー関数
 */
export const buildSheetData = (
  sheetId: string,
  template: SheetTemplate,
  records: Record<string, string>[],
): SheetData => {
  const rows = Array.from({ length: records.length }, (_, i) =>
    createRecordRowId(sheetId, i),
  );
  const cols = template.columns.map((c) => c.field as ColumnId);
  const colNames: Record<ColumnId, string> = {} as Record<ColumnId, string>;
  for (const c of template.columns) {
    colNames[c.field as ColumnId] = c.headerName;
  }

  const values = new Proxy({} as Record<string, string>, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") return undefined;
      const prefix = `${sheetId}-r`;
      if (prop.startsWith(prefix)) {
        const afterPrefix = prop.slice(prefix.length);
        const secondHyphen = afterPrefix.indexOf("-");
        if (secondHyphen !== -1) {
          const rowIndexStr = afterPrefix.slice(0, secondHyphen);
          const colField = afterPrefix.slice(secondHyphen + 1);
          const rowIndex = Number.parseInt(rowIndexStr, 10);
          if (!Number.isNaN(rowIndex)) {
            const record = records[rowIndex];
            return record ? (record[colField] ?? "") : "";
          }
        }
      }
      return "";
    },
    has(_target, prop: string | symbol) {
      if (typeof prop !== "string") return false;
      const prefix = `${sheetId}-r`;
      return prop.startsWith(prefix);
    },
  });

  return {
    id: sheetId,
    name: template.name,
    rows,
    cols,
    colNames,
    values,
  };
};

// --- Base State (Jotai Query からオンデマンド解決) ---

/**
 * アクティブシートの生レコード数に基づいた行 ID 配列をオンデマンド生成
 */
export const baseRowOrderAtom = atom<RowId[]>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return [];

  const records = get(sheetRecordsQuery.sync(activeSheetId));
  return Array.from({ length: records.length }, (_, i) =>
    createRecordRowId(activeSheetId, i),
  );
});

/**
 * アクティブシートの雛形カラム定義に基づいた列 ID 配列をオンデマンド生成
 */
export const baseColumnOrderAtom = atom<ColumnId[]>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return [];

  const metadata = get(workbookMetadataQuery.sync);
  const template = metadata.templates[activeSheetId];
  if (!template) return [];

  return template.columns.map((c) => c.field as ColumnId);
});

/**
 * アクティブシートの雛形カラム定義に基づいた列名マップをオンデマンド生成
 */
export const baseColumnNamesAtom = atom<Record<ColumnId, string>>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return {} as Record<ColumnId, string>;

  const metadata = get(workbookMetadataQuery.sync);
  const template = metadata.templates[activeSheetId];
  if (!template) return {} as Record<ColumnId, string>;

  const names: Record<ColumnId, string> = {} as Record<ColumnId, string>;
  for (const c of template.columns) {
    names[c.field as ColumnId] = c.headerName;
  }
  return names;
});

/**
 * 未編集セルの値を Jotai 非同期 Atom の生データからオンデマンドで取得する Proxy
 * 150,000 個のオブジェクト二重保持を廃止し、メモリ使用量 0 を達成する。
 */
export const baseCellValuesAtom = atom<Record<string, string>>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return {};

  const records = get(sheetRecordsQuery.sync(activeSheetId));

  return new Proxy({} as Record<string, string>, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") return undefined;

      const prefix = `${activeSheetId}-r`;
      if (prop.startsWith(prefix)) {
        const afterPrefix = prop.slice(prefix.length);
        const secondHyphen = afterPrefix.indexOf("-");
        if (secondHyphen !== -1) {
          const rowIndexStr = afterPrefix.slice(0, secondHyphen);
          const colField = afterPrefix.slice(secondHyphen + 1);
          const rowIndex = Number.parseInt(rowIndexStr, 10);
          if (!Number.isNaN(rowIndex)) {
            const record = records[rowIndex];
            return record ? (record[colField] ?? "") : "";
          }
        }
      }

      return "";
    },
    has(_target, prop: string | symbol) {
      if (typeof prop !== "string") return false;
      const prefix = `${activeSheetId}-r`;
      return prop.startsWith(prefix);
    },
  });
});

// 後方互換性 / 他の atom からの参照用
export const sheetDataMapAtom = atom<Record<string, SheetData>>({});
export const sheetFieldToColIdMapAtom = atom<
  Record<string, Record<string, ColumnId>>
>({});
