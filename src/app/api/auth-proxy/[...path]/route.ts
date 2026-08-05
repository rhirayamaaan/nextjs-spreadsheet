import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { decrypt, type SessionData } from "@/lib/api/session";

// 静的生成から除外するためのフラグ設定
export const dynamic = "force-dynamic";

type ProxyContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(req: NextRequest, context: ProxyContext) {
  const backendApiUrl = process.env.BACKEND_API_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!backendApiUrl || !sessionSecret) {
    return NextResponse.json(
      {
        error:
          "BFF is missing proxy configuration (BACKEND_API_URL, SESSION_SECRET)",
      },
      { status: 500 },
    );
  }

  // 1. パラメータの非同期解決 (Next.js 16/15)
  const { path } = await context.params;
  const subPath = path.join("/");

  // 2. セッション Cookie の取得と復号
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Unauthorized. No session token found." },
      { status: 401 },
    );
  }

  let accessToken: string;
  try {
    // jose 対応: decrypt の非同期 (await) 呼び出しへ変更
    const decrypted = await decrypt(sessionToken, sessionSecret);
    const sessionData: SessionData = JSON.parse(decrypted);

    // 有効期限のチェック
    if (sessionData.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "Unauthorized. Session expired." },
        { status: 401 },
      );
    }
    accessToken = sessionData.accessToken;
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid session format." },
      { status: 401 },
    );
  }

  // 3. 転送先 URL の構築
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = new URL(
    `${backendApiUrl}/${subPath}${searchParams ? `?${searchParams}` : ""}`,
  );

  // 4. ボディの取得 (GET/HEAD 以外で body が存在する場合のみ)
  let body: ReadableStream | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = req.body;
  }

  // 5. ヘッダーの複製と Authorization ヘッダーの上書き
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.delete("host"); // 転送先のホストを使用させるため削除
  headers.delete("connection");

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      body,
    };

    if (body) {
      // @ts-expect-error duplex option is required when sending streaming body in modern fetch in Node env
      fetchOptions.duplex = "half";
    }

    const backendRes = await fetch(targetUrl.toString(), fetchOptions);

    // 6. API からのレスポンスヘッダーを複製してクライアントに返却
    const resHeaders = new Headers(backendRes.headers);

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error("BFF Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Backend API." },
      { status: 502 },
    );
  }
}

// 主要な HTTP メソッドすべてに対応させる
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
