/**
 * Database seed — extend with demo users/wishlists when needed.
 * Run: pnpm --filter wishtracker-backend run prisma:seed
 */
async function main() {
  console.log("No seed data configured. Add users/wishlists in prisma/seed.ts if needed.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
