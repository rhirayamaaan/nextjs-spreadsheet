import { useCallback, useState } from "react";
import type { ColumnId } from "./stores/types";

export type UseColumnModalsReturn = {
  settingModalColId: ColumnId | null;
  filterModalColId: ColumnId | null;
  handleOpenSettingModal: (colId: ColumnId) => void;
  handleCloseSettingModal: () => void;
  handleOpenFilterModal: (colId: ColumnId) => void;
  handleCloseFilterModal: () => void;
};

export const useColumnModals = (): UseColumnModalsReturn => {
  const [settingModalColId, setSettingModalColId] = useState<ColumnId | null>(
    null,
  );
  const [filterModalColId, setFilterModalColId] = useState<ColumnId | null>(
    null,
  );

  const handleOpenSettingModal = useCallback((colId: ColumnId) => {
    setSettingModalColId(colId);
  }, []);

  const handleCloseSettingModal = useCallback(() => {
    setSettingModalColId(null);
  }, []);

  const handleOpenFilterModal = useCallback((colId: ColumnId) => {
    setFilterModalColId(colId);
  }, []);

  const handleCloseFilterModal = useCallback(() => {
    setFilterModalColId(null);
  }, []);

  return {
    settingModalColId,
    filterModalColId,
    handleOpenSettingModal,
    handleCloseSettingModal,
    handleOpenFilterModal,
    handleCloseFilterModal,
  };
};
