import crypto from "crypto"

const isProd = process.env.PHONEPE_ENV === "production"
const BASE_URL = isProd
  ? "https://api.phonepe.com/apis/hermes"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox"

function generateChecksum(payload: string, endpoint: string): string {
  const saltKey = process.env.PHONEPE_SALT_KEY!
  const saltIndex = process.env.PHONEPE_SALT_INDEX!
  const stringToHash = payload + endpoint + saltKey
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex")
  return `${sha256}###${saltIndex}`
}

export async function createPhonePeOrder({
  merchantTransactionId,
  amount,
  userId,
  redirectUrl,
}: {
  merchantTransactionId: string
  amount: number
  userId: number
  redirectUrl: string
}) {
  const payload = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: `USER${userId}`,
    amount: amount * 100, // paise me
    redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
    paymentInstrument: { type: "PAY_PAGE" },
  }

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64")
  const endpoint = "/pg/v1/pay"
  const checksum = generateChecksum(base64Payload, endpoint)

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  })

  const data = await response.json()
  return data
}

export async function checkPhonePeStatus(merchantTransactionId: string) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID!
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`
  const checksum = generateChecksum("", endpoint)

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  })

  const data = await response.json()
  return data
}

export function verifyWebhookSignature(receivedChecksum: string, body: string): boolean {
  const saltKey = process.env.PHONEPE_SALT_KEY!
  const saltIndex = process.env.PHONEPE_SALT_INDEX!
  const expectedHash = crypto.createHash("sha256").update(body + saltKey).digest("hex")
  const expectedChecksum = `${expectedHash}###${saltIndex}`
  return receivedChecksum === expectedChecksum
}

export function generateMerchantTransactionId(eventId: number, studentId: number): string {
  return `EVT${eventId}_STU${studentId}_${Date.now()}`
}