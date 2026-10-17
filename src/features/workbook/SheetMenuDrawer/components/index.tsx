import {
  ArrowLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  FileTextIcon,
  MagnifyingGlassIcon,
  StarFilledIcon,
  StarIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Reset,
  ScrollArea,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { SheetTemplate } from "../../stores/types";
import { drawerMessages } from "./i18n";
import styles from "./index.module.css";
import type { SheetMenuDrawerPresenterProps } from "./types";

type SheetMenuItemProps = {
  sheet: SheetTemplate & { categoryName?: string };
  isOpen: boolean;
  isActive: boolean;
  isFavorite: boolean;
  showCategoryBadge?: boolean;
  activeStatusLabel: string;
  openStatusLabel: string;
  favoriteAriaLabel: string;
  onSelectSheet: (sheetId: string) => void;
  onToggleFavorite: (sheetId: string) => void;
};

const SheetMenuItem: FC<SheetMenuItemProps> = ({
  sheet,
  isOpen,
  isActive,
  isFavorite,
  showCategoryBadge = false,
  activeStatusLabel,
  openStatusLabel,
  favoriteAriaLabel,
  onSelectSheet,
  onToggleFavorite,
}) => {
  return (
    <Flex
      align="center"
      width="100%"
      pr="4"
      className={`${styles.sheetItem} ${
        isActive ? styles.sheetItemActive : ""
      }`}
    >
      <Flex
        asChild
        direction="column"
        gap="1"
        flexGrow="1"
        minWidth="0"
        py="3"
        pl="4"
        pr="2"
        style={{ cursor: "pointer" }}
      >
        <Reset>
          <button type="button" onClick={() => onSelectSheet(sheet.id)}>
            <Flex align="center" justify="between" gap="2" width="100%">
              <Flex align="center" gap="2">
                <FileTextIcon width="16" height="16" aria-hidden="true" />
                <Text size="2" weight="medium">
                  {sheet.name}
                </Text>
              </Flex>
              <Flex align="center" gap="1">
                {showCategoryBadge && sheet.categoryName && (
                  <Badge size="1" variant="surface" color="gray">
                    {sheet.categoryName}
                  </Badge>
                )}
                {isActive && (
                  <Badge size="1" color="green" variant="solid">
                    {activeStatusLabel}
                  </Badge>
                )}
                {!isActive && isOpen && (
                  <Badge size="1" color="blue" variant="soft">
                    {openStatusLabel}
                  </Badge>
                )}
              </Flex>
            </Flex>
            {sheet.description && (
              <Text size="1" color="gray">
                {sheet.description}
              </Text>
            )}
          </button>
        </Reset>
      </Flex>
      <IconButton
        type="button"
        size="2"
        variant="ghost"
        color={isFavorite ? "amber" : "gray"}
        radius="full"
        onClick={() => onToggleFavorite(sheet.id)}
        aria-label={favoriteAriaLabel}
        aria-pressed={isFavorite}
      >
        {isFavorite ? (
          <StarFilledIcon width="16" height="16" aria-hidden="true" />
        ) : (
          <StarIcon width="16" height="16" aria-hidden="true" />
        )}
      </IconButton>
    </Flex>
  );
};

/**
 * 純粋な UI 描画を担当する Presenter コンポーネント
 */
export const SheetMenuDrawer: FC<SheetMenuDrawerPresenterProps> = ({
  open,
  onOpenChange,
  categories,
  sheetsByCategory,
  openSheetIds,
  favoriteSheetIds,
  favoriteSheets,
  activeSheetId,
  searchQuery,
  onChangeSearchQuery,
  selectedGroup,
  searchResults,
  totalSheetsCount,
  onSelectSheet,
  onToggleFavorite,
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
        <Flex
          align="center"
          justify="between"
          px="4"
          py="3"
          style={{ backgroundColor: "var(--gray-1)" }}
        >
          <Flex align="center" gap="2">
            <TableIcon
              width="20"
              height="20"
              color="var(--accent-9)"
              aria-hidden="true"
            />
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
              <Cross2Icon aria-hidden="true" />
            </IconButton>
          </Dialog.Close>
        </Flex>
        <Separator size="4" />

        {/* Search Bar */}
        <Box px="4" py="3" style={{ backgroundColor: "var(--gray-2)" }}>
          <TextField.Root
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" aria-hidden="true" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Separator size="4" />

        {/* Menu Body */}
        <ScrollArea type="hover" style={{ flex: 1 }}>
          {searchQuery.trim().length > 0 ? (
            /* 検索モード */
            <Flex direction="column">
              <Box px="4" pt="4" pb="2">
                <Heading size="3" weight="bold">
                  {t("searchResults")} ({searchResults.length})
                </Heading>
              </Box>
              {searchResults.length === 0 ? (
                <Flex justify="center" py="7" px="4">
                  <Text size="2" color="gray">
                    {t("noSheetsFound")}
                  </Text>
                </Flex>
              ) : (
                searchResults.map((sheet) => {
                  const isOpen = openSheetIds.includes(sheet.id);
                  const isActive = activeSheetId === sheet.id;
                  const isFavorite = favoriteSheetIds.includes(sheet.id);

                  return (
                    <SheetMenuItem
                      key={sheet.id}
                      sheet={sheet}
                      isOpen={isOpen}
                      isActive={isActive}
                      isFavorite={isFavorite}
                      showCategoryBadge={true}
                      activeStatusLabel={t("activeStatus")}
                      openStatusLabel={t("openStatus")}
                      favoriteAriaLabel={
                        isFavorite
                          ? t("removeFromFavorites", { name: sheet.name })
                          : t("addToFavorites", { name: sheet.name })
                      }
                      onSelectSheet={onSelectSheet}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })
              )}
            </Flex>
          ) : selectedGroup ? (
            /* カテゴリ詳細（サブメニュー） */
            <Flex direction="column">
              {/* 戻るボタン */}
              <Flex
                asChild
                align="center"
                gap="3"
                width="100%"
                px="4"
                py="3"
                className={styles.interactiveRow}
              >
                <Reset>
                  <button type="button" onClick={onBackToMain}>
                    <ArrowLeftIcon width="18" height="18" aria-hidden="true" />
                    <Text size="3" weight="bold">
                      {t("mainMenu")}
                    </Text>
                  </button>
                </Reset>
              </Flex>
              <Separator size="4" />

              {/* カテゴリタイトル */}
              <Box px="4" pt="4" pb="2">
                <Heading size="4" weight="bold">
                  {selectedGroup.category.name}
                </Heading>
              </Box>

              {/* 所属シート一覧 */}
              {selectedGroup.sheets.map((sheet) => {
                const isOpen = openSheetIds.includes(sheet.id);
                const isActive = activeSheetId === sheet.id;
                const isFavorite = favoriteSheetIds.includes(sheet.id);

                return (
                  <SheetMenuItem
                    key={sheet.id}
                    sheet={sheet}
                    isOpen={isOpen}
                    isActive={isActive}
                    isFavorite={isFavorite}
                    activeStatusLabel={t("activeStatus")}
                    openStatusLabel={t("openStatus")}
                    favoriteAriaLabel={
                      isFavorite
                        ? t("removeFromFavorites", { name: sheet.name })
                        : t("addToFavorites", { name: sheet.name })
                    }
                    onSelectSheet={onSelectSheet}
                    onToggleFavorite={onToggleFavorite}
                  />
                );
              })}
            </Flex>
          ) : (
            /* メインメニュー（よく使う項目 + カテゴリ一覧） */
            <Flex direction="column">
              <Box px="4" pt="4" pb="2">
                <Heading size="3" weight="bold">
                  {t("favoritesSection")}
                </Heading>
              </Box>
              {favoriteSheets.length === 0 ? (
                <Box px="4" py="3">
                  <Text size="2" color="gray">
                    {t("noFavoriteSheets")}
                  </Text>
                </Box>
              ) : (
                favoriteSheets.map((sheet) => {
                  const isOpen = openSheetIds.includes(sheet.id);
                  const isActive = activeSheetId === sheet.id;
                  const isFavorite = favoriteSheetIds.includes(sheet.id);

                  return (
                    <SheetMenuItem
                      key={sheet.id}
                      sheet={sheet}
                      isOpen={isOpen}
                      isActive={isActive}
                      isFavorite={isFavorite}
                      showCategoryBadge={true}
                      activeStatusLabel={t("activeStatus")}
                      openStatusLabel={t("openStatus")}
                      favoriteAriaLabel={
                        isFavorite
                          ? t("removeFromFavorites", { name: sheet.name })
                          : t("addToFavorites", { name: sheet.name })
                      }
                      onSelectSheet={onSelectSheet}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })
              )}

              <Separator size="4" my="2" />

              <Box px="4" pt="3" pb="2">
                <Heading size="3" weight="bold">
                  {t("categoriesSection")}
                </Heading>
              </Box>
              {categories.map((cat) => {
                const group = sheetsByCategory.find(
                  (g) => g.category.id === cat.id,
                );
                const count = group?.sheets.length ?? 0;

                return (
                  <Flex
                    key={cat.id}
                    asChild
                    align="center"
                    justify="between"
                    width="100%"
                    px="4"
                    py="3"
                    className={styles.interactiveRow}
                  >
                    <Reset>
                      <button
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                      >
                        <Flex align="center" gap="2">
                          <Text size="3" weight="medium">
                            {cat.name}
                          </Text>
                          <Badge size="1" variant="soft" color="gray">
                            {count}
                          </Badge>
                        </Flex>
                        <Text color="gray" asChild>
                          <ChevronRightIcon
                            width="18"
                            height="18"
                            aria-hidden="true"
                          />
                        </Text>
                      </button>
                    </Reset>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export * from "./types";
