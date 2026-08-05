import crypto from "crypto";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/api/error";

/**
 * ログインエンドポイント:
 * PKCE フローに必要な verifier/state を生成して Cookie に退避し、
 * OIDC サーバーの認可ページへユーザーをリダイレクトします。
 */
export const GET = handleError(async (_req: NextRequest) => {
  const issuer = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!issuer || !clientId || !appUrl) {
    throw new Error(
      "Missing required OIDC environment variables (OIDC_ISSUER, OIDC_CLIENT_ID, NEXT_PUBLIC_APP_URL)",
    );
  }

  // PKCE と state の生成
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  // OIDC 認可エンドポイントURLの構築
  const authUrl = new URL(`${issuer}/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/callback`);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("scope", "openid profile email");

  const response = NextResponse.redirect(authUrl.toString());
  const cookieStore = await cookies();

  // 一時クッキーへの退避 (5分間有効)
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  cookieStore.set("oauth_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return response;
});
