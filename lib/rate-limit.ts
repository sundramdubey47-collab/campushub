type RateLimitConfig = {
  maxAttempts: number
  windowMs: number
  useBackoff?: boolean
}

const attempts = new Map<string, { count: number; resetAt: number; lockUntil?: number }>()

// Configurable thresholds — env variables se override ho sakte hain, hardcoded nahi
export const RATE_LIMITS = {
  AUTH_STRICT: {
    maxAttempts: Number(process.env.RATE_LIMIT_AUTH_MAX) || 5,
    windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
    useBackoff: true,
  },
  PUBLIC_MODERATE: {
    maxAttempts: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 30,
    windowMs: Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 60 * 1000,
  },
  AUTHENTICATED_LOOSE: {
    maxAttempts: Number(process.env.RATE_LIMIT_AUTHED_MAX) || 100,
    windowMs: Number(process.env.RATE_LIMIT_AUTHED_WINDOW_MS) || 60 * 1000,
  },
} satisfies Record<string, RateLimitConfig>

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const record = attempts.get(key)

  // Agar pehle se koi backoff lock chal raha hai
  if (record?.lockUntil && now < record.lockUntil) {
    return { allowed: false, retryAfterMs: record.lockUntil - now }
  }

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true }
  }

  if (record.count >= config.maxAttempts) {
    if (config.useBackoff) {
      // Exponential backoff: har baar limit cross karne par lock time double hota jaata hai
      const violationCount = Math.floor(record.count / config.maxAttempts)
      const backoffMs = Math.min(config.windowMs * Math.pow(2, violationCount), 60 * 60 * 1000) // max 1 hour
      record.lockUntil = now + backoffMs
      record.count += 1
      return { allowed: false, retryAfterMs: backoffMs }
    }
    return { allowed: false, retryAfterMs: record.resetAt - now }
  }

  record.count += 1
  return { allowed: true }
}