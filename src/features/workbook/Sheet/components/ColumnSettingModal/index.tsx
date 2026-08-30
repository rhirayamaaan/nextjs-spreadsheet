import { Dialog, Flex } from "@radix-ui/themes";
import type { FC } from "react";
import type { ColumnId } from "../../../stores";
import { useColumnSettingModalContainer } from "../../containers/useColumnSettingModalContainer";
import { KeyColumnSelector } from "./KeyColumnSelector";
import { LookupColumnSelector } from "./LookupColumnSelector";
import { ModalFooter } from "./ModalFooter";
import { ModeSelector } from "./ModeSelector";
import { SheetSelector } from "./SheetSelector";
import type { ColumnSettingModalPresenterProps } from "./types";

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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 520, padding: 24 }}>
        <Dialog.Title>カラムのプルダウン設定</Dialog.Title>
        <Dialog.Description size="2" mb="4" color="gray">
          マスターシートのデータを紐付け、セルのプルダウン選択と隣への参照カラム自動連動を設定します。
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <SheetSelector
            candidateSheets={candidateSheets}
            selectedSheetId={selectedSheetId}
            onSelectSheet={onSelectSheet}
          />

          <KeyColumnSelector
            candidateColumns={candidateColumns}
            selectedKeyColId={selectedKeyColId}
            onSelectKeyCol={onSelectKeyCol}
            keyColName={keyColName}
            onChangeKeyColName={onChangeKeyColName}
          />

          <LookupColumnSelector
            lookupColumns={lookupColumns}
            onToggleLookupCol={onToggleLookupCol}
            onChangeLookupColName={onChangeLookupColName}
          />

          <ModeSelector mode={mode} onChangeMode={onChangeMode} />
        </Flex>

        <ModalFooter
          onSave={onSave}
          onCancel={onCancel}
          disableSave={!selectedKeyColId}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export type ColumnSettingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetColId: ColumnId;
};

export const ColumnSettingModal: FC<ColumnSettingModalProps> & {
  Presenter: typeof ColumnSettingModalPresenter;
  SheetSelector: typeof SheetSelector;
  KeyColumnSelector: typeof KeyColumnSelector;
  LookupColumnSelector: typeof LookupColumnSelector;
  ModeSelector: typeof ModeSelector;
  Footer: typeof ModalFooter;
} = (props) => {
  const presenterProps = useColumnSettingModalContainer(props);
  return <ColumnSettingModalPresenter {...presenterProps} />;
};

ColumnSettingModal.Presenter = ColumnSettingModalPresenter;
ColumnSettingModal.SheetSelector = SheetSelector;
ColumnSettingModal.KeyColumnSelector = KeyColumnSelector;
ColumnSettingModal.LookupColumnSelector = LookupColumnSelector;
ColumnSettingModal.ModeSelector = ModeSelector;
ColumnSettingModal.Footer = ModalFooter;

export * from "./types";
