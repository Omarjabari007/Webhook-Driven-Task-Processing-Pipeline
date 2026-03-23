import "dotenv/config";
import { generateSignature } from "../utils/signature.ts"

const input = process.argv[2];

if (!input) {
  console.log("Provide JSON payload");
  process.exit(1);
}
const payload = JSON.parse(input);
console.log("Signature:", generateSignature(payload));