import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/api/auth0";

export const dynamic = "force-dynamic";

/**
 * BFF API プロキシ
 * Auth0 からアクセストークンを取得し、Authorization: Bearer ヘッダーを付与して
 * バックエンド API (BACKEND_API_URL) へリクエストを中継します。
 */
async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    return NextResponse.json(
      { error: "Missing BACKEND_API_URL" },
      { status: 500 },
    );
  }

  // 1. ワンライナーでアクセストークン取得 (セッション非存在時は null)
  const tokenRes = await auth0.getAccessToken().catch(() => null);
  if (!tokenRes?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. 転送先 URL とヘッダーの構築
  const { path } = await params;
  const targetUrl = `${backendApiUrl}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${tokenRes.token}`);
  headers.delete("host");

  // 3. バックエンド API へ転送
  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? null : req.body,
    // @ts-expect-error duplex option is required for streaming body in Node.js fetch
    duplex: "half",
  });

  // 4. API レスポンスをそのままクライアントへ返却
  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: backendRes.headers,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
