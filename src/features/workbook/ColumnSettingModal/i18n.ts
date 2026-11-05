export const columnSettingMessages = {
  ja: {
    title: "カラムのプルダウン設定",
    description:
      "マスターシートのデータを紐付け、セルのプルダウン選択と隣への参照カラム自動連動を設定します。",
    sheetSelectorLabel: "参照先マスターシート",
    keyColLabel: "キー列（プルダウンで選択する値の列）",
    keyColPlaceholder: "列の表示名",
    lookupColsLabel: "自動追加する参照列（複数選択可）",
    lookupReadOnlyBadge: "編集不可（動的参照）",
    lookupDescription:
      "キー列の隣に自動追加され、選択されたキーに対応するマスターデータが自動表示されます。",
    noCandidateColumns: "キー列以外の候補列がありません",
    headerNamePlaceholder: "ヘッダー表示名",
    uiTypeLabel: "セルの選択UIタイプ",
    modeDropdown: "ドロップダウン（一覧から選択）",
    modeCombobox: "コンボボックス（検索入力付き）",
    cancel: "キャンセル",
    save: "設定を保存",
    defaultColumnName: "列 {index}",
  },
  en: {
    title: "Column Pulldown Settings",
    description:
      "Link master sheet data to configure cell dropdown selection and automatic lookup columns.",
    sheetSelectorLabel: "Target Master Sheet",
    keyColLabel: "Key Column (values selected in pulldown)",
    keyColPlaceholder: "Column display name",
    lookupColsLabel:
      "Lookup Columns to Add Automatically (multiple selectable)",
    lookupReadOnlyBadge: "Read-only (Dynamic lookup)",
    lookupDescription:
      "Automatically added next to key column, showing master data corresponding to the selected key.",
    noCandidateColumns: "No candidate columns other than key column",
    headerNamePlaceholder: "Header display name",
    uiTypeLabel: "Cell Selection UI Type",
    modeDropdown: "Dropdown (select from list)",
    modeCombobox: "Combobox (with search input)",
    cancel: "Cancel",
    save: "Save Settings",
    defaultColumnName: "Column {index}",
  },
} as const;
