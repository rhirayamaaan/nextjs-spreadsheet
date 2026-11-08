import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  activeSheetModeAtom,
  pasteRowsAtom,
  workbookStatusAtom,
} from "../stores";

export const useSheetClipboard = () => {
  const sheetMode = useAtomValue(activeSheetModeAtom);
  const pasteRows = useSetAtom(pasteRowsAtom);
  const setStatus = useSetAtom(workbookStatusAtom);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (sheetMode === "inquiry") return;

      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      if (isInput) return;

      const text = event.clipboardData?.getData("text/plain");
      if (!text) return;

      const rowsData = text
        .split(/\r?\n/)
        .filter((row) => row.length > 0)
        .map((row) => row.split("\t"));

      if (rowsData.length > 0) {
        pasteRows(rowsData);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [pasteRows, sheetMode]);

  useEffect(() => {
    const handleMouseUp = () => {
      setStatus((prev) => (prev === "selecting" ? "idle" : prev));
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setStatus]);
};
