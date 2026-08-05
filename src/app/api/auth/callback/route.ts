import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/api/error";
import { encrypt } from "@/lib/api/session";

/**
 * コールバックエンドポイント:
 * OIDC サーバーから返却された認可コードをトークン群と交換し、
 * トークンを暗号化したセッション Cookie を設定します。
 */
export const GET = handleError(async (req: NextRequest) => {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const verifier = cookieStore.get("oauth_verifier")?.value;

  // 1. state の検証および値の存在チェック
  if (!state || state !== savedState || !code || !verifier) {
    return NextResponse.json(
      { error: "Invalid state or verification code. CSRF check failed." },
      { status: 400 },
    );
  }

  const issuer = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!issuer || !clientId || !appUrl || !sessionSecret) {
    throw new Error(
      "BFF is missing configuration variables (OIDC_ISSUER, OIDC_CLIENT_ID, NEXT_PUBLIC_APP_URL, SESSION_SECRET).",
    );
  }

  // 2. 認可コードとトークンの交換 (Token Exchange)
  const bodyParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: `${appUrl}/api/auth/callback`,
    code_verifier: verifier,
  });

  if (clientSecret) {
    bodyParams.set("client_secret", clientSecret);
  }

  const tokenRes = await fetch(`${issuer}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: bodyParams,
  });

  if (!tokenRes.ok) {
    const errorDetails = await tokenRes.text();
    throw new Error(
      `Failed to exchange token with OIDC provider: ${errorDetails}`,
    );
  }

  const tokens = await tokenRes.json();

  // 3. セッションデータの暗号化
  const sessionData = JSON.stringify({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || undefined,
    idToken: tokens.id_token || undefined,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  });

  // jose を使った暗号化 (非同期)
  const encryptedSession = await encrypt(sessionData, sessionSecret);

  // 4. クライアントをダッシュボードへリダイレクト
  const response = NextResponse.redirect(new URL("/debug/dashboard", req.url));

  // 5. 暗号化したセッションを HttpOnly Cookie にセット
  response.cookies.set("session_token", encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日間有効
  });

  // 6. 用済みのログイン用一時 Cookie を削除
  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_verifier");

  return response;
});
