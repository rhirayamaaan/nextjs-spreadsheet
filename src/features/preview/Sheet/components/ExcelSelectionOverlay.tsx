import { type FC, useLayoutEffect, useState } from "react";
import styles from "./index.module.css";

interface ExcelSelectionOverlayProps {
  selectedCellAddress: string | null;
  columnWidths: number[];
}

export const ExcelSelectionOverlay: FC<ExcelSelectionOverlayProps> = ({
  selectedCellAddress,
  columnWidths,
}) => {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recalculate when selection or widths change
  useLayoutEffect(() => {
    if (!selectedCellAddress) {
      setStyle(null);
      return;
    }

    const cellEl = document.querySelector(
      `[data-address="${selectedCellAddress}"]`,
    ) as HTMLElement | null;

    if (!cellEl) {
      setStyle(null);
      return;
    }

    const wrapper = cellEl.closest(
      `.${styles.sheetWrapper}`,
    ) as HTMLElement | null;

    if (!wrapper) return;

    // Measure exact cell offsets relative to the scroll container
    const cellOffsetLeft = cellEl.offsetLeft;
    const cellOffsetTop = cellEl.offsetTop;
    const cellWidth = cellEl.offsetWidth;
    const cellHeight = cellEl.offsetHeight;

    setStyle({
      position: "absolute",
      left: `${cellOffsetLeft}px`,
      top: `${cellOffsetTop}px`,
      width: `${cellWidth}px`,
      height: `${cellHeight}px`,
      pointerEvents: "none",
      border: "2px solid var(--blue-8)",
      boxSizing: "border-box",
      zIndex: 5,
    });
  }, [selectedCellAddress, columnWidths]);

  if (!style) return null;

  return <div className={styles.selectionOverlay} style={style} />;
};

export default ExcelSelectionOverlay;
