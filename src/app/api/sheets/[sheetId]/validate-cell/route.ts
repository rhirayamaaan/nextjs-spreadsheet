import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const { sheetId } = await params;
  const body = await request.json();
  const { colId, value } = body;

  console.log(`[POST /api/sheets/${sheetId}/validate-cell] Validating:`, {
    sheetId,
    colId,
    value,
  });

  // 擬似的なネットワーク遅延（非同期バリデーション検証用）
  await new Promise((resolve) => setTimeout(resolve, 600));

  // モック検証ルール:
  // "NG", "DUP", "ERROR", "EXIST" または "0000" を含む場合はサーバー重複エラーとする
  const trimmed = String(value ?? "").trim();
  if (
    trimmed === "NG" ||
    trimmed === "DUP" ||
    trimmed === "ERROR" ||
    trimmed === "EXIST" ||
    trimmed === "0000"
  ) {
    return NextResponse.json({
      valid: false,
      message: `「${trimmed}」はサーバーデータベースに既に登録されているため使用できません`,
    });
  }

  return NextResponse.json({
    valid: true,
  });
}
