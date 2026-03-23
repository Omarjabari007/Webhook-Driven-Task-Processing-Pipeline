import crypto from "crypto";

const SECRET = process.env.WEBHOOK_SECRET!;

export function generateSignature(payload: any): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

export function verifySignature(payload: any, signature: string): boolean {
  const expected = generateSignature(payload);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}