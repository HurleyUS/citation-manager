import { describe, expect, it } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import { signGoogleServiceAccountJwt } from "./googleJwt";

function decodeJwtPart(part: string): Record<string, unknown> {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<string, unknown>;
}

describe("signGoogleServiceAccountJwt", () => {
  it("signs a three-part RS256 JWT from a PKCS8 service account key", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

    const jwt = await signGoogleServiceAccountJwt({
      client_email: "sa@example.iam.gserviceaccount.com",
      private_key: pem,
      private_key_id: "test-key",
    });

    const parts = jwt.split(".");
    expect(parts).toHaveLength(3);

    const header = decodeJwtPart(parts[0]!);
    const claims = decodeJwtPart(parts[1]!);

    expect(header.alg).toBe("RS256");
    expect(header.typ).toBe("JWT");
    expect(header.kid).toBe("test-key");
    expect(claims.iss).toBe("sa@example.iam.gserviceaccount.com");
    expect(claims.aud).toBe("https://oauth2.googleapis.com/token");
    expect(claims.scope).toBe("https://www.googleapis.com/auth/business.manage");
    expect(jwt.startsWith("Bearer ")).toBe(false);
  });
});
