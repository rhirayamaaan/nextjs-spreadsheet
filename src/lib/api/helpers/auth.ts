import { auth0 } from "@/lib/api/auth0";

/**
 * Server Components や Route Handlers でログイン中のユーザー情報を取得する汎用ヘルパー
 * 認証済みの場合は UserProfile、未ログインの場合は null を返します。
 */
export async function getAuthUser() {
  const session = await auth0.getSession();
  return session?.user ?? null;
}
