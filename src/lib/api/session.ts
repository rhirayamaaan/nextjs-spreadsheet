import crypto from "crypto";
import * as jose from "jose";

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number; // トークンの有効期限 (ミリ秒タイムスタンプ)
}

/**
 * 任意の SESSION_SECRET 文字列から、安全な 32バイト (256ビット) の暗号キーを生成します
 */
function getSecretKey(secret: string): Uint8Array {
  const hash = crypto.createHash("sha256").update(secret).digest();
  return new Uint8Array(hash);
}

/**
 * プレーンテキストを jose (Compact JWE) で暗号化します
 */
export async function encrypt(text: string, secret: string): Promise<string> {
  if (!secret) {
    throw new Error("SESSION_SECRET is required for encryption");
  }

  const secretKey = getSecretKey(secret);

  // 直接鍵暗号化 (alg: "dir")、暗号化方式 AES-256-GCM (enc: "A256GCM")
  return await new jose.CompactEncrypt(new TextEncoder().encode(text))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secretKey);
}

/**
 * 暗号化された JWE テキストを復号します。
 * 改ざんが検知された場合、またはフォーマットが無効な場合はエラーを投げます。
 */
export async function decrypt(jwe: string, secret: string): Promise<string> {
  if (!secret) {
    throw new Error("SESSION_SECRET is required for decryption");
  }

  const secretKey = getSecretKey(secret);

  const { plaintext } = await jose.compactDecrypt(jwe, secretKey);
  return new TextDecoder().decode(plaintext);
}
