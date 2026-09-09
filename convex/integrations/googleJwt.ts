export type GoogleServiceAccount = {
  private_key_id?: string;
  private_key: string;
  client_email: string;
};

function base64UrlFromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlFromJson(value: unknown): string {
  return base64UrlFromBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToPkcs8(pem: string): ArrayBuffer {
  if (!pem.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON private_key must be PKCS8 PEM (BEGIN PRIVATE KEY).",
    );
  }
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Sign a Google service-account JWT (RS256) for the OAuth token endpoint.
 */
export async function signGoogleServiceAccountJwt(
  account: GoogleServiceAccount,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
    ...(account.private_key_id ? { kid: account.private_key_id } : {}),
  };
  const claims = {
    iss: account.client_email,
    sub: account.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/business.manage",
  };

  const signingInput = `${base64UrlFromJson(header)}.${base64UrlFromJson(claims)}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlFromBytes(new Uint8Array(signature))}`;
}
