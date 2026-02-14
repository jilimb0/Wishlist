export default () => ({
  port: parseInt(process.env.PORT || "3010", 10),
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
})
