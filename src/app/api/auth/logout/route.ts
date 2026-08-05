import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/api/error";

/**
 * ログアウトエンドポイント:
 * セッション Cookie をクリアし、OIDC プロバイダー側のログアウト（設定時のみ）を呼び出して
 * アプリケーションのトップページヘリダイレクトします。
 */
export const GET = handleError(async (req: NextRequest) => {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || new URL("/", req.url).origin;
  const logoutUrlString = process.env.OIDC_LOGOUT_URL;

  let response: NextResponse;

  // 1. OIDC プロバイダー側のログアウトエンドポイントが設定されている場合はそちらにリダイレクト
  if (logoutUrlString) {
    try {
      const logoutUrl = new URL(logoutUrlString);
      logoutUrl.searchParams.set("post_logout_redirect_uri", appUrl);
      response = NextResponse.redirect(logoutUrl.toString());
    } catch {
      // 不正なURLだった場合はローカルでのログアウトにフォールバック
      response = NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    // 未設定の場合はトップページに戻す
    response = NextResponse.redirect(new URL("/", req.url));
  }

  // 2. BFF側のセッション Cookie を破棄
  response.cookies.delete("session_token");

  return response;
});
