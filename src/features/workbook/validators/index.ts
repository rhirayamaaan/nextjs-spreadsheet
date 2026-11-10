import { commonValidators } from "./common";
import { employeeValidators } from "./sheets/employees.validator";
import { productionVolumeValidators } from "./sheets/productionVolume.validator";
import type { CustomValidatorRegistry } from "./types";

export * from "./names";
export * from "./resolver";
export * from "./types";

/**
 * 2つのカスタムバリデータレジストリをディープマージする純粋関数
 */
export const mergeCustomValidatorRegistries = (
  base: CustomValidatorRegistry,
  override?: CustomValidatorRegistry,
): CustomValidatorRegistry => {
  if (!override) return base;
  const mergedSheets = { ...base.sheets };
  if (override.sheets) {
    for (const [sheetId, validators] of Object.entries(override.sheets)) {
      mergedSheets[sheetId] = {
        ...mergedSheets[sheetId],
        ...validators,
      };
    }
  }
  return {
    common: { ...base.common, ...override.common },
    sheets: mergedSheets,
  };
};

/**
 * アプリケーション標準のバリデータレジストリ
 */
export const defaultValidatorRegistry: CustomValidatorRegistry = {
  common: commonValidators,
  sheets: {
    employees: employeeValidators,
    sheet_1: employeeValidators,
    "production-volume": productionVolumeValidators,
  },
};
