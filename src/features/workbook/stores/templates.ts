import { atom } from "jotai";
import { workbookMetadataQuery } from "../services/workbookMetadata/workbookMetadata.query";
import type { SheetCategory, SheetTemplate } from "./types";
import {
  activeSheetIdAtom,
  favoriteSheetIdsAtom,
  openSheetIdsAtom,
} from "./ui";

export { favoriteSheetIdsAtom, openSheetIdsAtom };

// 全カテゴリ（workbookMetadataQuery から導出）
export const sheetCategoriesAtom = atom<SheetCategory[]>((get) => {
  return get(workbookMetadataQuery.sync).categories;
});

// 全シート雛形カタログ（workbookMetadataQuery から導出）
export const sheetTemplatesAtom = atom<Record<string, SheetTemplate>>((get) => {
  return get(workbookMetadataQuery.sync).templates;
});

// 全シート雛形配列
export const allSheetTemplatesAtom = atom((get) => {
  const templates = get(sheetTemplatesAtom);
  return Object.values(templates);
});

// カテゴリ別シート一覧を計算する純粋関数
export const computeSheetsByCategory = (
  categories: SheetCategory[],
  templates: Record<string, SheetTemplate>,
): { category: SheetCategory; sheets: SheetTemplate[] }[] => {
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
};

// カテゴリ別シート一覧マップ
export const sheetsByCategoryAtom = atom((get) => {
  const metadata = get(workbookMetadataQuery.sync);
  return computeSheetsByCategory(metadata.categories, metadata.templates);
});

// 現在アクティブなシートの雛形
export const activeSheetTemplateAtom = atom<SheetTemplate | null>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return null;
  const templates = get(sheetTemplatesAtom);
  return templates[activeSheetId] ?? null;
});

// 現在開いているシート雛形一覧（SheetTabs 用）
export const openSheetsAtom = atom((get) => {
  const metadata = get(workbookMetadataQuery.sync);
  const openIds = get(openSheetIdsAtom) ?? metadata.initialOpenSheetIds;
  const templates = metadata.templates;
  return openIds
    .map((id) => templates[id])
    .filter((t): t is SheetTemplate => Boolean(t));
});

// シートのお気に入り登録・解除トグルアクション
export const toggleFavoriteSheetAtom = atom(
  null,
  (
    get,
    set,
    payload: string | { sheetId: string; defaultFavorites?: string[] },
  ) => {
    const sheetId = typeof payload === "string" ? payload : payload.sheetId;
    const defaultFavorites =
      typeof payload === "string" ? undefined : payload.defaultFavorites;

    const metadata = get(workbookMetadataQuery.sync);
    const currentFavorites =
      get(favoriteSheetIdsAtom) ??
      defaultFavorites ??
      metadata.favoriteSheetIds ??
      [];
    const isCurrentlyFavorite = currentFavorites.includes(sheetId);
    const nextFavorites = isCurrentlyFavorite
      ? currentFavorites.filter((id) => id !== sheetId)
      : [...currentFavorites, sheetId];
    set(favoriteSheetIdsAtom, nextFavorites);
  },
);

// --- シート開閉・切り替えアクション ---

export const openSheetAtom = atom(
  null,
  (
    get,
    set,
    payload: string | { sheetId: string; defaultOpenIds?: string[] },
  ) => {
    const sheetId = typeof payload === "string" ? payload : payload.sheetId;
    const defaultOpenIds =
      typeof payload === "string" ? undefined : payload.defaultOpenIds;

    const metadata = get(workbookMetadataQuery.sync);
    const currentOpenIds =
      get(openSheetIdsAtom) ?? defaultOpenIds ?? metadata.initialOpenSheetIds;
    if (!currentOpenIds.includes(sheetId)) {
      set(openSheetIdsAtom, [...currentOpenIds, sheetId]);
    }
    set(activeSheetIdAtom, sheetId);
  },
);

export const closeSheetAtom = atom(
  null,
  (
    get,
    set,
    payload: string | { sheetId: string; defaultOpenIds?: string[] },
  ) => {
    const sheetId = typeof payload === "string" ? payload : payload.sheetId;
    const defaultOpenIds =
      typeof payload === "string" ? undefined : payload.defaultOpenIds;

    const metadata = get(workbookMetadataQuery.sync);
    const currentOpenIds =
      get(openSheetIdsAtom) ?? defaultOpenIds ?? metadata.initialOpenSheetIds;
    const nextOpenIds = currentOpenIds.filter((id) => id !== sheetId);
    set(openSheetIdsAtom, nextOpenIds);

    const currentActiveId = get(activeSheetIdAtom);
    if (currentActiveId === sheetId) {
      const nextActiveId = nextOpenIds[0] ?? null;
      set(activeSheetIdAtom, nextActiveId);
    }
  },
);

export const toggleSheetAtom = atom(
  null,
  (
    get,
    set,
    payload: string | { sheetId: string; defaultOpenIds?: string[] },
  ) => {
    const sheetId = typeof payload === "string" ? payload : payload.sheetId;
    const defaultOpenIds =
      typeof payload === "string" ? undefined : payload.defaultOpenIds;

    const metadata = get(workbookMetadataQuery.sync);
    const currentOpenIds =
      get(openSheetIdsAtom) ?? defaultOpenIds ?? metadata.initialOpenSheetIds;
    if (currentOpenIds.includes(sheetId)) {
      set(closeSheetAtom, payload);
    } else {
      set(openSheetAtom, payload);
    }
  },
);
