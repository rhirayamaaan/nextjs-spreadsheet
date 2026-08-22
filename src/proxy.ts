import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/api/auth0";

/**
 * Next.js 16 Proxy Layer
 * Auth0 の認証ミドルウェアを実行し、/auth/login, /auth/callback, /auth/logout 等を自動ハンドリングします。
 */
export async function proxy(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
