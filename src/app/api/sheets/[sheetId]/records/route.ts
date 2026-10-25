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

  return NextResponse.json({
    success: true,
    sheetId,
    savedAt: new Date().toISOString(),
  });
}
