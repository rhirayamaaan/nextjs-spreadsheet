import { type NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  req: NextRequest,
  context: any,
) => Promise<NextResponse> | NextResponse;

/**
 * Next.js Route Handler (BFF API) 専用の共通エラーハンドリングラッパー関数です。
 * try-catch およびエラーレスポンス (NextResponse) の一貫性を保証します。
 */
export function handleError(handler: RouteHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error("BFF API Error:", error);

      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
