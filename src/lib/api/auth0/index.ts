import { Auth0Client } from "@auth0/nextjs-auth0/server";

/**
 * Auth0 SDK v4 クライアントインスタンス
 * 環境変数 (AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, APP_BASE_URL)
 * から自動的に設定を読み込みます。
 */
export const auth0 = new Auth0Client();
