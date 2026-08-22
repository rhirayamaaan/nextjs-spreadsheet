import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import Link from "next/link";
import { auth0 } from "@/lib/api/auth0";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthUser();
  let session = null;
  let accessToken: string | undefined;
  let sessionError = "";

  try {
    session = await auth0.getSession();
    if (session) {
      const tokenRes = await auth0.getAccessToken();
      accessToken = tokenRes?.token;
    }
  } catch (err) {
    console.error("Dashboard Auth0 session error:", err);
    sessionError = err instanceof Error ? err.message : "Session error";
  }

  return (
    <Container size="2" p="4">
      <Flex direction="column" gap="4">
        {/* ヘッダーセクション */}
        <Flex justify="between" align="center" pb="3">
          <Heading size="6">認証デモ ダッシュボード (Auth0)</Heading>
          {user ? (
            <Button color="red" variant="soft" asChild>
              <Link href="/auth/logout">ログアウト</Link>
            </Button>
          ) : (
            <Button color="blue" variant="solid" asChild>
              <Link href="/auth/login">ログイン</Link>
            </Button>
          )}
        </Flex>

        {/* ユーザープロフィール情報 */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">ログインユーザー情報 (Auth0 User)</Heading>
            {user ? (
              <Flex direction="column" gap="2">
                <Text>
                  <strong>名前:</strong> {user.name || "未設定"}
                </Text>
                <Text>
                  <strong>メールアドレス:</strong> {user.email || "未設定"}
                </Text>
                <Text>
                  <strong>ユーザーID (sub):</strong> {user.sub || "未設定"}
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap="2">
                <Text color="gray">
                  Auth0
                  セッションからユーザー情報を取得できませんでした（未ログイン）。
                </Text>
                <Text size="2">
                  <Link href="/auth/login">ログインページへ進む</Link>
                </Text>
              </Flex>
            )}
          </Flex>
        </Card>

        {/* トークン詳細・セッション状況 */}
        <Card size="2">
          <Flex direction="column" gap="3">
            <Heading size="4">
              セッション・トークン情報 (Auth0 SDK 管理)
            </Heading>

            {sessionError && (
              <Badge color="red" size="2">
                エラー: {sessionError}
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
                  <Badge color="green">有効</Badge>
                </Flex>
                {accessToken && (
                  <Text>
                    <strong>アクセストークン (先頭15文字のみ表示):</strong>{" "}
                    <code
                      style={{
                        backgroundColor: "var(--gray-3)",
                        padding: "2px 4px",
                        borderRadius: "4px",
                      }}
                    >
                      {accessToken.substring(0, 15)}...
                    </code>
                  </Text>
                )}
              </Flex>
            ) : (
              <Text color="gray">有効な Auth0 セッションが存在しません。</Text>
            )}
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
