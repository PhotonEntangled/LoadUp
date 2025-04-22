"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Map, Settings, Truck, Sun, Moon, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { navItems } from "@/components/Sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const iconMap: { [key: string]: React.ElementType } = {
    "📊": Home,
    "🗺️": Map,
    "📦": Truck,
    "🧪": Settings,
    "📄": FileText,
    "👥": User,
    "🚚": Truck,
    "📈": Home,
    "⚙️": Settings,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-border">
        {/* Logo and App Name */}
        <div className="flex h-14 items-center px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LoadUp</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const IconComponent = iconMap[item.icon] || Home;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-2"
                        : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <IconComponent className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center border-b border-border bg-background px-4 md:px-6">
          {/* Mobile Logo (visible on small screens) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LoadUp</span>
          </div>

          {/* Page Title - Shows current page name (Added from V0) */}
          <div className="ml-4 md:ml-6 text-sm font-medium text-muted-foreground flex-1 truncate md:flex-none">
            {navItems.find((item) => pathname?.startsWith(item.href))?.name || "LoadUp"}
          </div>

          {/* User Profile & Theme Toggle */}
          <div className="ml-auto flex items-center gap-4">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    console.log('Switching to light theme');
                    setTheme("light");
                  }}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    console.log('Switching to dark theme');
                    setTheme("dark");
                  }}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    console.log('Switching to system theme');
                    setTheme("system");
                  }}>
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 