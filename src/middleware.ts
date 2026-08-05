import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. 認証が必要なルート（例: /debug/dashboard やその配下）へのアクセス制限
  if (pathname.startsWith("/debug/dashboard")) {
    if (!sessionToken) {
      // セッション Cookie がない場合は、OIDC ログイン開始用 API へ強制リダイレクト
      const loginUrl = new URL("/api/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 2. ミドルウェアが適用されるルートを設定
export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのリクエストパスにマッチさせます:
     * - api (API ルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, public フォルダ内の画像など
     */
    "/debug/dashboard/:path*",
  ],
};
