import Razorpay from "razorpay";
import crypto from "crypto";

// ─── Server-side Razorpay instance ────────────────────────────────────────────
// This file is server-only — never import on client
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
      );
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// ─── Signature Verification ────────────────────────────────────────────────────
// NEVER trust frontend payment verification — always verify server-side
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not set");

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(razorpaySignature, "hex")
  );
}

// ─── Amount helpers ────────────────────────────────────────────────────────────
/** Convert INR to paise (Razorpay uses smallest currency unit) */
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

/** Convert paise to INR */
export const paiseToRupees = (paise: number): number => paise / 100;
