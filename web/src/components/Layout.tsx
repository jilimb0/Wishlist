import { Outlet } from "react-router-dom"
import { MobileNav } from "./MobileNav"
import { Navbar } from "./Navbar"

export function Layout() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0a0a0a] pt-(--safe-top)">
      {/* Desktop navbar — hidden on mobile */}
      <div className="hidden md:block flex-none">
        <Navbar />
      </div>

      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 py-4 md:py-8 overflow-y-auto scrollbar-hide pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden flex-none">
        <MobileNav />
      </div>
    </div>
  )
}
