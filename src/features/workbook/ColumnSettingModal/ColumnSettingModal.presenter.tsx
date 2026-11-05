import { Dialog, Flex } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { ColumnId, PulldownMode } from "../stores/types";
import { columnSettingMessages } from "./i18n";
import { KeyColumnSelectorPresenter } from "./KeyColumnSelector.presenter";
import { LookupColumnSelectorPresenter } from "./LookupColumnSelector.presenter";
import { ModalFooterPresenter } from "./ModalFooter.presenter";
import { ModeSelectorPresenter } from "./ModeSelector.presenter";
import { SheetSelectorPresenter } from "./SheetSelector.presenter";

export type CandidateSheet = {
  id: string;
  name: string;
};

export type CandidateColumn = {
  id: ColumnId;
  name: string;
};

export type LookupColumnItem = {
  colId: ColumnId;
  name: string;
  selected: boolean;
  headerName: string;
};

export type ColumnSettingModalPresenterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateSheets: CandidateSheet[];
  selectedSheetId: string;
  onSelectSheet: (sheetId: string) => void;
  candidateColumns: CandidateColumn[];
  selectedKeyColId: ColumnId | "";
  onSelectKeyCol: (colId: ColumnId) => void;
  keyColName: string;
  onChangeKeyColName: (name: string) => void;
  lookupColumns: LookupColumnItem[];
  onToggleLookupCol: (colId: ColumnId, selected: boolean) => void;
  onChangeLookupColName: (colId: ColumnId, name: string) => void;
  mode: PulldownMode;
  onChangeMode: (mode: PulldownMode) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ColumnSettingModalPresenter: FC<
  ColumnSettingModalPresenterProps
> = ({
  open,
  onOpenChange,
  candidateSheets,
  selectedSheetId,
  onSelectSheet,
  candidateColumns,
  selectedKeyColId,
  onSelectKeyCol,
  keyColName,
  onChangeKeyColName,
  lookupColumns,
  onToggleLookupCol,
  onChangeLookupColName,
  mode,
  onChangeMode,
  onSave,
  onCancel,
}) => {
  const { t } = useI18n(columnSettingMessages);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 520, padding: 24 }}>
        <Dialog.Title>{t("title")}</Dialog.Title>
        <Dialog.Description size="2" mb="4" color="gray">
          {t("description")}
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <SheetSelectorPresenter
            candidateSheets={candidateSheets}
            selectedSheetId={selectedSheetId}
            onSelectSheet={onSelectSheet}
          />

          <KeyColumnSelectorPresenter
            candidateColumns={candidateColumns}
            selectedKeyColId={selectedKeyColId}
            onSelectKeyCol={onSelectKeyCol}
            keyColName={keyColName}
            onChangeKeyColName={onChangeKeyColName}
          />

          <LookupColumnSelectorPresenter
            lookupColumns={lookupColumns}
            onToggleLookupCol={onToggleLookupCol}
            onChangeLookupColName={onChangeLookupColName}
          />

          <ModeSelectorPresenter mode={mode} onChangeMode={onChangeMode} />

          <ModalFooterPresenter onSave={onSave} onCancel={onCancel} />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
