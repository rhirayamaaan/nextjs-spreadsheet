import { NextResponse } from "next/server";
import { MOCK_SHEET_TEMPLATES } from "@/app/api/_mock/metadata";
import { fetchMockSheetRecords } from "@/app/api/_mock/records";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const { sheetId } = await params;

  // 擬似的なネットワーク遅延 (Suspense の動作確認用)
  await new Promise((resolve) => setTimeout(resolve, 200));

  const template = MOCK_SHEET_TEMPLATES[sheetId];
  const rowCount = template?.defaultRowCount ?? 100;
  const records = fetchMockSheetRecords(sheetId, rowCount);

  return NextResponse.json({ sheetId, records });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const { sheetId } = await params;
  const body = await request.json();

  console.log(`[POST /api/sheets/${sheetId}/records] Received diff:`, {
    sheetId,
    cellEditsCount: Object.keys(body.diff?.cellEdits ?? {}).length,
    rowStatusesCount: Object.keys(body.diff?.rowStatuses ?? {}).length,
  });

  // 擬似的なネットワーク/DB保存遅延
  await new Promise((resolve) => setTimeout(resolve, 400));

  // モック: "SAVE_ERR" という値が編集差分に含まれている場合、サーバー側一括検証エラーを返却
  const cellEdits: Record<string, string> = body.diff?.cellEdits ?? {};
  const serverErrors: Array<{ rowId: string; colId: string; message: string }> =
    [];

  for (const [key, val] of Object.entries(cellEdits)) {
    if (val === "SAVE_ERR") {
      const lastHyphenIndex = key.lastIndexOf("-");
      const rId = key.substring(0, lastHyphenIndex);
      const cId = key.substring(lastHyphenIndex + 1);
      serverErrors.push({
        rowId: rId,
        colId: cId,
        message: "サーバー検証エラー: 競合または業務制約に違反しています",
      });
    }
  }

  if (serverErrors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        sheetId,
        errors: serverErrors,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    success: true,
    sheetId,
    savedAt: new Date().toISOString(),
  });
}
