import type { ColumnId, PulldownMode } from "../../../stores";

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
