import { expect, test } from "@playwright/test"

test("login page loads", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("heading", { name: /WishTracker/i })).toBeVisible()
})

test("register page loads", async ({ page }) => {
  await page.goto("/register")
  await expect(page.getByText(/Create your account/i)).toBeVisible()
})
