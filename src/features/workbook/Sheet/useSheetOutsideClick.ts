import { type RefObject, useEffect } from "react";
import type { ActiveCell } from "../stores/types";

export type UseSheetOutsideClickParams = {
  parentRef: RefObject<HTMLDivElement | null>;
  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;
};

/**
 * シート外クリックを検知し、編集中のセルがある場合は確定（blur / commit）して編集モードを終了するフック。
 * Google Sheets や Excel と同様、セルの選択枠自体は外側クリックでも維持する。
 * Radix UI ポータル（Popover、Dialog、Menu等）内の操作時は編集を終了しない。
 */
export const useSheetOutsideClick = ({
  parentRef,
  activeCell,
  setActiveCell,
}: UseSheetOutsideClickParams) => {
  useEffect(() => {
    // 編集モードでない場合はリスナー登録不要
    if (activeCell === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      // 主ボタン (左クリック) 以外は除外
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // 1. シートコンテナ内部（セル、ヘッダー、フッター等）は除外
      if (parentRef.current?.contains(target)) return;

      // 2. Radix UI の各種ポータル要素（Popover、Modal、Select、Menu等）は除外
      if (
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[role='dialog']") ||
        target.closest("[role='menu']") ||
        target.closest("[role='listbox']") ||
        target.closest("[data-radix-focus-guard]")
      ) {
        return;
      }

      // 3. シート外クリック時: アクティブな入力要素を blur させて先行コミットし、編集モードを終了
      if (
        document.activeElement instanceof HTMLElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        document.activeElement.blur();
      }
      setActiveCell(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [parentRef, activeCell, setActiveCell]);
};
