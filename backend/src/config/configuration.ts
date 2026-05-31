export default () => ({
  port: Number.parseInt(process.env.PORT || "3010", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  appUrl: process.env.APP_URL || "http://localhost:3011",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3011,http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  jwt: {
    secret: (() => {
      const s = process.env.JWT_SECRET
      if (!s) throw new Error("JWT_SECRET environment variable is required")
      return s
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  mail: {
    from: process.env.MAIL_FROM || "WishTracker <noreply@wishtracker.local>",
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  priceTracking: {
    enabled: process.env.PRICE_TRACKING_ENABLED !== "false",
    cron: process.env.PRICE_TRACKING_CRON || "0 */6 * * *",
  },
  storage: {
    uploadsDir: process.env.UPLOADS_DIR || "uploads",
  },
})
