import type { CustomValidator, CustomValidatorRegistry } from "./types";

const warnedMissingValidators = new Set<string>();

/**
 * カスタムバリデータ名をシートIDとレジストリから解決するリゾルバ
 */
export const resolveCustomValidator = (
  name: string,
  sheetId: string | undefined,
  registry: CustomValidatorRegistry | undefined,
): CustomValidator | undefined => {
  if (!registry) return undefined;

  // 1. アクティブシート専用のバリデータから検索
  if (sheetId && registry.sheets?.[sheetId]?.[name]) {
    return registry.sheets[sheetId][name];
  }

  // 2. コロン区切りプレフィックスによる検索 (例: employees:requireIfContract)
  if (name.includes(":")) {
    const [prefix, subName] = name.split(":");
    // sheets[prefix][name] または sheets[prefix][subName]
    if (registry.sheets?.[prefix]?.[name]) {
      return registry.sheets[prefix][name];
    }
    if (registry.sheets?.[prefix]?.[subName]) {
      return registry.sheets[prefix][subName];
    }
  }

  // 3. 共通バリデータから検索
  if (registry.common?.[name]) {
    return registry.common[name];
  }

  // 4. 見つからない場合の開発時警告（同一キーは1度のみ警告）
  if (process.env.NODE_ENV !== "production") {
    const warnKey = `${sheetId ?? "unknown"}:${name}`;
    if (!warnedMissingValidators.has(warnKey)) {
      warnedMissingValidators.add(warnKey);
      console.warn(
        `[Workbook Validator] Custom validator "${name}" is not registered for sheet "${sheetId ?? "unknown"}".`,
      );
    }
  }

  return undefined;
};
