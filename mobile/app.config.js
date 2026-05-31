export default ({ config }) => ({
  ...config,
  name: "WishTracker",
  slug: "wishtracker",
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3010/api",
  },
})
