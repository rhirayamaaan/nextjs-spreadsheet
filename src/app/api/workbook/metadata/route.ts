import { NextResponse } from "next/server";
import {
  MOCK_FAVORITE_SHEET_IDS,
  MOCK_INITIAL_OPEN_SHEET_IDS,
  MOCK_SHEET_CATEGORIES,
  MOCK_SHEET_TEMPLATES,
} from "@/app/api/_mock/metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  // 擬似的なネットワーク遅延
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json({
    categories: MOCK_SHEET_CATEGORIES,
    templates: MOCK_SHEET_TEMPLATES,
    initialOpenSheetIds: MOCK_INITIAL_OPEN_SHEET_IDS,
    favoriteSheetIds: MOCK_FAVORITE_SHEET_IDS,
  });
}
