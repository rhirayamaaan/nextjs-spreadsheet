import {
  ArrowLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  FileTextIcon,
  MagnifyingGlassIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import { drawerMessages } from "./i18n";
import styles from "./SheetMenuDrawer.module.css";
import type {
  SheetMenuDrawerPresenterProps,
  SheetMenuDrawerProps,
} from "./types";
import { useSheetMenuDrawerContainer } from "./useSheetMenuDrawerContainer";

/**
 * 純粋な UI 描画を担当する Presenter コンポーネント
 */
export const SheetMenuDrawerPresenter: FC<SheetMenuDrawerPresenterProps> = ({
  open,
  onOpenChange,
  categories,
  sheetsByCategory,
  openSheetIds,
  activeSheetId,
  searchQuery,
  onChangeSearchQuery,
  selectedGroup,
  searchResults,
  totalSheetsCount,
  onSelectSheet,
  onSelectCategory,
  onBackToMain,
}) => {
  const { t } = useI18n(drawerMessages);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className={styles.drawerContent}
        aria-describedby={undefined}
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <Flex align="center" gap="2">
            <TableIcon width="20" height="20" color="var(--accent-9)" />
            <Dialog.Title size="4" mb="0">
              {t("sheetMenuTitle")}
            </Dialog.Title>
            <Badge size="1" variant="soft" color="gray">
              {t("totalSheets", { count: totalSheetsCount })}
            </Badge>
          </Flex>
          <Dialog.Close>
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label={t("closeDrawer")}
            >
              <Cross2Icon />
            </IconButton>
          </Dialog.Close>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <TextField.Root
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </div>

        {/* Menu Body */}
        <ScrollArea type="hover" className={styles.scrollArea}>
          {searchQuery.trim().length > 0 ? (
            /* 検索モード */
            <div className={styles.menuList}>
              <div className={styles.sectionHeader}>
                {t("searchResults")} ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className={styles.emptyState}>
                  <Text size="2" color="gray">
                    {t("noSheetsFound")}
                  </Text>
                </div>
              ) : (
                searchResults.map((sheet) => {
                  const isOpen = openSheetIds.includes(sheet.id);
                  const isActive = activeSheetId === sheet.id;

                  return (
                    <button
                      type="button"
                      key={sheet.id}
                      className={`${styles.sheetItem} ${
                        isActive ? styles.sheetItemActive : ""
                      }`}
                      onClick={() => onSelectSheet(sheet.id)}
                    >
                      <div className={styles.sheetItemHeader}>
                        <Flex align="center" gap="2">
                          <FileTextIcon width="16" height="16" />
                          <span className={styles.sheetItemTitle}>
                            {sheet.name}
                          </span>
                        </Flex>
                        <Flex align="center" gap="1">
                          <Badge size="1" variant="surface" color="gray">
                            {sheet.categoryName}
                          </Badge>
                          {isActive && (
                            <Badge size="1" color="green" variant="solid">
                              {t("activeStatus")}
                            </Badge>
                          )}
                          {!isActive && isOpen && (
                            <Badge size="1" color="blue" variant="soft">
                              {t("openStatus")}
                            </Badge>
                          )}
                        </Flex>
                      </div>
                      {sheet.description && (
                        <div className={styles.sheetItemDesc}>
                          {sheet.description}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : selectedGroup ? (
            /* カテゴリ詳細（サブメニュー） */
            <div className={styles.menuList}>
              {/* 戻るボタン */}
              <button
                type="button"
                className={styles.backNavButton}
                onClick={onBackToMain}
              >
                <ArrowLeftIcon width="18" height="18" />
                <span>{t("mainMenu")}</span>
              </button>

              {/* カテゴリタイトル */}
              <div className={styles.subCategoryTitle}>
                {selectedGroup.category.name}
              </div>

              {/* 所属シート一覧 */}
              {selectedGroup.sheets.map((sheet) => {
                const isOpen = openSheetIds.includes(sheet.id);
                const isActive = activeSheetId === sheet.id;

                return (
                  <button
                    type="button"
                    key={sheet.id}
                    className={`${styles.sheetItem} ${
                      isActive ? styles.sheetItemActive : ""
                    }`}
                    onClick={() => onSelectSheet(sheet.id)}
                  >
                    <div className={styles.sheetItemHeader}>
                      <Flex align="center" gap="2">
                        <FileTextIcon width="16" height="16" />
                        <span className={styles.sheetItemTitle}>
                          {sheet.name}
                        </span>
                      </Flex>
                      {isActive && (
                        <Badge size="1" color="green" variant="solid">
                          {t("activeStatus")}
                        </Badge>
                      )}
                      {!isActive && isOpen && (
                        <Badge size="1" color="blue" variant="soft">
                          {t("openStatus")}
                        </Badge>
                      )}
                    </div>
                    {sheet.description && (
                      <div className={styles.sheetItemDesc}>
                        {sheet.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* メインメニュー（カテゴリ一覧） */
            <div className={styles.menuList}>
              <div className={styles.sectionHeader}>
                {t("categoriesSection")}
              </div>
              {categories.map((cat) => {
                const group = sheetsByCategory.find(
                  (g) => g.category.id === cat.id,
                );
                const count = group?.sheets.length ?? 0;

                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={styles.categoryItem}
                    onClick={() => onSelectCategory(cat.id)}
                  >
                    <span className={styles.categoryName}>
                      {cat.name}
                      <Badge size="1" variant="soft" color="gray">
                        {count}
                      </Badge>
                    </span>
                    <ChevronRightIcon
                      width="18"
                      height="18"
                      className={styles.chevronIcon}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  );
};

/**
 * Container フックと Presenter を結合したコンポーネント
 */
export const SheetMenuDrawer: FC<SheetMenuDrawerProps> & {
  Presenter: typeof SheetMenuDrawerPresenter;
} = (props) => {
  const presenterProps = useSheetMenuDrawerContainer(props);
  return <SheetMenuDrawerPresenter {...presenterProps} />;
};

SheetMenuDrawer.Presenter = SheetMenuDrawerPresenter;

export * from "./types";
export * from "./useSheetMenuDrawerContainer";
