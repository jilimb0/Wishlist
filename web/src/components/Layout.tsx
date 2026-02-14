import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { MobileNav } from "./MobileNav"

export function Layout() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Desktop navbar — hidden on mobile */}
      <div className="hidden md:block flex-none">
        <Navbar />
      </div>

      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 py-4 md:py-8 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden flex-none">
        <MobileNav />
      </div>
    </div>
  )
}
