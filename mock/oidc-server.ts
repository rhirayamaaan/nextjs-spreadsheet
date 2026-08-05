import { type Configuration, Provider } from "oidc-provider";

const configuration: Configuration = {
  // テスト用クライアント情報 (BFFの設定と完全一致させる必要があります)
  clients: [
    {
      client_id: "sample-client-id",
      client_secret: "sample-client-secret",
      grant_types: ["authorization_code"],
      redirect_uris: ["http://localhost:3000/api/auth/callback"], // Next.js BFF側のコールバックURL
      response_types: ["code"],
    },
  ],
  // ログイン成功時に返却するダミーのユーザー情報
  findAccount: async (ctx, id) => {
    return {
      accountId: id,
      claims: async () => ({
        sub: id,
        name: "山田 太郎",
        email: "yamada@example.com",
        picture: "https://placehold.co/100/3b82f6/ffffff?text=YT",
      }),
    };
  },
  // クッキー保護署名用のダミーキー設定
  cookies: {
    keys: ["some-temporary-key-for-local-mock-oidc-server"],
  },
  // 認可エンドポイントのパスをNext.js側の実装に合わせて /authorize に変更
  routes: {
    authorization: "/authorize",
  },
};

const port = 3001;
const oidc = new Provider(`http://localhost:${port}`, configuration);

// ローカルの HTTP 開発環境 (非 HTTPS) を許容するためのプロキシフラグ
oidc.proxy = true;

oidc.listen(port, () => {
  console.log(
    `\n🚀 OIDC モックサーバーが起動しました: http://localhost:${port}`,
  );
  console.log(
    `   メタデータ URL: http://localhost:${port}/.well-known/openid-configuration`,
  );
  console.log(
    `\n👉 Next.js 側の .env.local に以下を設定して動作検証を行ってください：`,
  );
  console.log(`   OIDC_ISSUER=http://localhost:${port}`);
  console.log(`   OIDC_CLIENT_ID=sample-client-id`);
  console.log(`   OIDC_CLIENT_SECRET=sample-client-secret\n`);
});
