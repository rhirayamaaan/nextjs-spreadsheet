import type { SheetTemplate } from "../../stores/types";

/**
 * 指定シートとその参照マスタシートの依存順（トポロジカル順序）ID一覧を解決する純粋ヘルパー関数
 */
export const getSheetDependencyIds = (
  sheetId: string,
  templates: Record<string, SheetTemplate>,
): string[] => {
  const ids: string[] = [];
  const visited = new Set<string>();

  const visit = (targetId: string) => {
    if (visited.has(targetId)) return;
    visited.add(targetId);

    const template = templates[targetId];
    if (!template) return;

    for (const col of template.columns) {
      if (col.type.type === "pulldown" || col.type.type === "lookup") {
        const depId = col.type.sourceTemplateId;
        visit(depId);
        if (col.type.type === "pulldown" && col.type.relation?.targetSheetId) {
          visit(col.type.relation.targetSheetId);
        }
      }
    }
    ids.push(targetId);
  };

  visit(sheetId);
  return ids;
};

/**
 * 編集差分（cellEdits）を既存レコード配列にマージした新しいレコード配列を生成する純粋関数
 */
export const applyEditsToRecords = (
  records: Record<string, string>[],
  sheetId: string,
  cellEdits: Record<string, string>,
): Record<string, string>[] => {
  if (Object.keys(cellEdits).length === 0) return records;

  const prefix = `${sheetId}-r`;
  const nextRecords = [...records];
  const modifiedRows = new Map<number, Record<string, string>>();

  for (const [key, value] of Object.entries(cellEdits)) {
    if (!key.startsWith(prefix)) continue;
    const afterPrefix = key.slice(prefix.length);
    const hyphenIndex = afterPrefix.indexOf("-");
    if (hyphenIndex === -1) continue;

    const rowIndex = Number.parseInt(afterPrefix.slice(0, hyphenIndex), 10);
    const colField = afterPrefix.slice(hyphenIndex + 1);
    if (
      Number.isNaN(rowIndex) ||
      rowIndex < 0 ||
      rowIndex >= nextRecords.length
    ) {
      continue;
    }

    let row = modifiedRows.get(rowIndex);
    if (!row) {
      row = { ...nextRecords[rowIndex] };
      modifiedRows.set(rowIndex, row);
      nextRecords[rowIndex] = row;
    }
    row[colField] = value;
  }

  return nextRecords;
};
