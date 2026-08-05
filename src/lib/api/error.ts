import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  req: NextRequest,
  context: any
) => Promise<NextResponse> | NextResponse;

/**
 * Next.js Route Handler (BFF API) 共通のエラーハンドリングラッパー関数です。
 * try-catch およびエラーレスポンスの一貫性を保証します。
 */
export function handleError(handler: RouteHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error("BFF API Error:", error);

      // JWE (jose) の復号に失敗した場合は無効なセッションとして 401 扱いにする
      if (error instanceof Error && error.message.includes("JWEDecryptionFailed")) {
        return NextResponse.json(
          { error: "Invalid or expired session token." },
          { status: 401 }
        );
      }

      // 一般的な予期せぬエラーは 500 で返却
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}
