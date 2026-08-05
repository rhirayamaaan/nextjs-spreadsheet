import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { cookies } from "next/headers";
import Link from "next/link";
import { decrypt, type SessionData } from "@/lib/api/session";

// IDトークンのペイロード部分をパースしてデコードするヘルパー
function decodeIdToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  const sessionSecret = process.env.SESSION_SECRET;

  let session: SessionData | null = null;
  let userProfile: {
    name?: string;
    email?: string;
    picture?: string;
    sub?: string;
  } | null = null;
  let decryptionError = "";

  if (sessionToken && sessionSecret) {
    try {
      // jose 対応: decrypt を非同期 (await) で呼び出すように修正
      const decrypted = await decrypt(sessionToken, sessionSecret);
      session = JSON.parse(decrypted) as SessionData;

      if (session.idToken) {
        userProfile = decodeIdToken(session.idToken);
      }
    } catch (err) {
      console.error("Dashboard decryption error:", err);
      decryptionError =
        err instanceof Error ? err.message : "Failed to decrypt session";
    }
  }

  const isExpired = session ? session.expiresAt < Date.now() : true;

  return (
    <Container size="2" p="4">
      <Flex direction="column" gap="4">
        {/* ヘッダーセクション */}
        <Flex justify="between" align="center" pb="3">
          <Heading size="6">認証デモ ダッシュボード</Heading>
          <Button color="red" variant="soft" asChild>
            <Link href="/api/auth/logout">ログアウト</Link>
          </Button>
        </Flex>

        {/* ユーザープロフィール情報 */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">ログインユーザー情報</Heading>
            {userProfile ? (
              <Flex direction="column" gap="2">
                <Text>
                  <strong>ユーザーID (sub):</strong>{" "}
                  {userProfile.sub || "未設定"}
                </Text>
              </Flex>
            ) : (
              <Text color="gray">
                IDトークンからプロフィール情報を取得できませんでした。
              </Text>
            )}
          </Flex>
        </Card>

        {/* トークン詳細・セッション状況 */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">セッション・トークン情報 (BFF格納データ)</Heading>

            {decryptionError && (
              <Badge color="red" size="2">
                復号エラー: {decryptionError}
              </Badge>
            )}

            {session ? (
              <Flex
                direction="column"
                gap="2"
                style={{ wordBreak: "break-all" }}
              >
                <Flex gap="2" align="center">
                  <Text>
                    <strong>セッションステータス:</strong>
                  </Text>
                  {isExpired ? (
                    <Badge color="red">有効期限切れ</Badge>
                  ) : (
                    <Badge color="green">有効</Badge>
                  )}
                </Flex>
                <Text>
                  <strong>セッション有効期限:</strong>{" "}
                  {new Date(session.expiresAt).toLocaleString()}
                </Text>
                <Text>
                  <strong>アクセストークン (先頭15文字のみ表示):</strong>{" "}
                  <code
                    style={{
                      backgroundColor: "var(--gray-3)",
                      padding: "2px 4px",
                      borderRadius: "4px",
                    }}
                  >
                    {session.accessToken.substring(0, 15)}...
                  </code>
                </Text>
                {session.refreshToken && (
                  <Text>
                    <strong>リフレッシュトークン (存在確認):</strong>{" "}
                    <Badge color="blue">あり</Badge>
                  </Text>
                )}
              </Flex>
            ) : (
              <Text color="gray">セッションデータが存在しません。</Text>
            )}
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
