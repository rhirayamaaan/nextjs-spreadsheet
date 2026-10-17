import { atom } from "jotai";
import {
  baseCellValuesAtom,
  baseColumnNamesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
  sheetDataMapAtom,
  sheetFieldToColIdMapAtom,
} from "./base";
import { columnConfigsAtom, referencedSheetsDataAtom } from "./binding";
import {
  modifiedColumnNamesAtom,
  modifiedColumnOrdersAtom,
  modifiedRowOrdersAtom,
} from "./edit";
import { columnTotalsAtom } from "./summary";
import type { SheetCategory, SheetTemplate } from "./types";
import { activeSheetIdAtom } from "./ui";
import { columnValidationsAtom } from "./validation";

// --- 雛形管理 Atom 群（Template State Atoms） ---

// 全カテゴリ
export const sheetCategoriesAtom = atom<SheetCategory[]>([]);

// 全シート雛形カタログ
export const sheetTemplatesAtom = atom<Record<string, SheetTemplate>>({});

// お気に入り登録されているシートID配列
export const favoriteSheetIdsAtom = atom<string[]>([]);

// メタデータ一括初期化アクション
export const initWorkbookMetadataAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      categories: SheetCategory[];
      templates: Record<string, SheetTemplate>;
      initialOpenSheetIds?: string[];
      favoriteSheetIds?: string[];
    },
  ) => {
    set(sheetCategoriesAtom, payload.categories);
    set(sheetTemplatesAtom, payload.templates);
    if (payload.initialOpenSheetIds && payload.initialOpenSheetIds.length > 0) {
      set(openSheetIdsAtom, payload.initialOpenSheetIds);
    }
    const initialFavorites =
      payload.favoriteSheetIds ??
      Object.values(payload.templates)
        .filter((t) => t.isFavorite)
        .map((t) => t.id);
    set(favoriteSheetIdsAtom, initialFavorites);
  },
);

// シートのお気に入り登録・解除トグルアクション
export const toggleFavoriteSheetAtom = atom(
  null,
  (get, set, sheetId: string) => {
    const currentFavorites = get(favoriteSheetIdsAtom);
    const isCurrentlyFavorite = currentFavorites.includes(sheetId);
    const nextFavorites = isCurrentlyFavorite
      ? currentFavorites.filter((id) => id !== sheetId)
      : [...currentFavorites, sheetId];
    set(favoriteSheetIdsAtom, nextFavorites);

    const templates = get(sheetTemplatesAtom);
    const targetTemplate = templates[sheetId];
    if (targetTemplate) {
      set(sheetTemplatesAtom, {
        ...templates,
        [sheetId]: {
          ...targetTemplate,
          isFavorite: !isCurrentlyFavorite,
        },
      });
    }
  },
);

// 全シート雛形配列
export const allSheetTemplatesAtom = atom((get) => {
  const templates = get(sheetTemplatesAtom);
  return Object.values(templates);
});

// カテゴリ別シート一覧マップ
export const sheetsByCategoryAtom = atom((get) => {
  const templates = get(sheetTemplatesAtom);
  const categories = get(sheetCategoriesAtom);
  const result: { category: SheetCategory; sheets: SheetTemplate[] }[] = [];

  for (const cat of categories) {
    const sheets = Object.values(templates).filter(
      (t) => t.category === cat.id,
    );
    result.push({ category: cat, sheets });
  }

  // カテゴリ未分類のシートがあれば fallback カテゴリに追加
  const knownCatIds = new Set(categories.map((c) => c.id));
  const uncategorizedSheets = Object.values(templates).filter(
    (t) => !knownCatIds.has(t.category),
  );
  if (uncategorizedSheets.length > 0) {
    result.push({
      category: { id: "other", name: "その他" },
      sheets: uncategorizedSheets,
    });
  }

  return result;
});

// 現在開いている（タブに表示されている）シートID配列
export const openSheetIdsAtom = atom<string[]>([]);

// 現在アクティブなシートの雛形
export const activeSheetTemplateAtom = atom<SheetTemplate | null>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return null;
  const templates = get(sheetTemplatesAtom);
  return templates[activeSheetId] ?? null;
});

// 現在開いているシート雛形一覧（SheetTabs 用）
export const openSheetsAtom = atom((get) => {
  const openIds = get(openSheetIdsAtom);
  const templates = get(sheetTemplatesAtom);
  return openIds
    .map((id) => templates[id])
    .filter((t): t is SheetTemplate => Boolean(t));
});

// --- シート開閉・切り替えアクション（Jotai GC 対応） ---

export const openSheetAtom = atom(null, (get, set, sheetId: string) => {
  const currentOpenIds = get(openSheetIdsAtom);
  if (!currentOpenIds.includes(sheetId)) {
    set(openSheetIdsAtom, [...currentOpenIds, sheetId]);
  }
  set(activeSheetIdAtom, sheetId);
});

/**
 * シートを閉じ、関連する Jotai Atom から参照を削除して GC を促す
 */
export const closeSheetAtom = atom(null, (get, set, sheetId: string) => {
  // 1. 開いているシートリストから削除
  const currentOpenIds = get(openSheetIdsAtom);
  const nextOpenIds = currentOpenIds.filter((id) => id !== sheetId);
  set(openSheetIdsAtom, nextOpenIds);

  // 2. アクティブシートの切り替え
  const currentActiveId = get(activeSheetIdAtom);
  if (currentActiveId === sheetId) {
    const nextActiveId = nextOpenIds[0] ?? null;
    set(activeSheetIdAtom, nextActiveId);

    if (nextActiveId) {
      const sheetDataMap = get(sheetDataMapAtom);
      const nextData = sheetDataMap[nextActiveId];
      if (nextData) {
        set(baseCellValuesAtom, nextData.values);
        set(baseRowOrderAtom, nextData.rows);
        set(baseColumnOrderAtom, nextData.cols);
        set(baseColumnNamesAtom, nextData.colNames);
      }
    } else {
      set(baseCellValuesAtom, {});
      set(baseRowOrderAtom, []);
      set(baseColumnOrderAtom, []);
      set(baseColumnNamesAtom, {});
    }
  }

  // 3. メモリ解放（他の開いているシートから参照されていない場合のみ解放）
  const allConfigs = get(columnConfigsAtom);
  const allTemplates = get(sheetTemplatesAtom);
  const isReferenced = nextOpenIds.some((openId) => {
    // 列設定での参照チェック
    const configs = allConfigs[openId];
    if (configs) {
      for (const config of Object.values(configs)) {
        if (
          config.type === "pulldown" &&
          config.pulldown.sourceSheetId === sheetId
        ) {
          return true;
        }
        if (
          config.type === "lookup" &&
          config.lookup.sourceSheetId === sheetId
        ) {
          return true;
        }
      }
    }
    // テンプレート定義での参照チェック
    const template = allTemplates[openId];
    if (template) {
      for (const col of template.columns) {
        if (
          (col.type.type === "pulldown" || col.type.type === "lookup") &&
          col.type.sourceTemplateId === sheetId
        ) {
          return true;
        }
      }
    }
    return false;
  });

  if (!isReferenced) {
    const referencedSheets = { ...get(referencedSheetsDataAtom) };
    delete referencedSheets[sheetId];
    set(referencedSheetsDataAtom, referencedSheets);

    const sheetDataMap = { ...get(sheetDataMapAtom) };
    delete sheetDataMap[sheetId];
    set(sheetDataMapAtom, sheetDataMap);

    const fieldToColMap = { ...get(sheetFieldToColIdMapAtom) };
    delete fieldToColMap[sheetId];
    set(sheetFieldToColIdMapAtom, fieldToColMap);
  }

  const configs = { ...get(columnConfigsAtom) };
  delete configs[sheetId];
  set(columnConfigsAtom, configs);

  const totals = { ...get(columnTotalsAtom) };
  delete totals[sheetId];
  set(columnTotalsAtom, totals);

  const validations = { ...get(columnValidationsAtom) };
  delete validations[sheetId];
  set(columnValidationsAtom, validations);

  // 4. 編集差分状態のクリーンアップ
  const modRowOrders = { ...get(modifiedRowOrdersAtom) };
  delete modRowOrders[sheetId];
  set(modifiedRowOrdersAtom, modRowOrders);

  const modColOrders = { ...get(modifiedColumnOrdersAtom) };
  delete modColOrders[sheetId];
  set(modifiedColumnOrdersAtom, modColOrders);

  const modColNames = { ...get(modifiedColumnNamesAtom) };
  delete modColNames[sheetId];
  set(modifiedColumnNamesAtom, modColNames);
});

export const toggleSheetAtom = atom(null, (get, set, sheetId: string) => {
  const currentOpenIds = get(openSheetIdsAtom);
  if (currentOpenIds.includes(sheetId)) {
    set(closeSheetAtom, sheetId);
  } else {
    set(openSheetAtom, sheetId);
  }
});
