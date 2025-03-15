"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  userType: "customer" | "provider"
}

const Navbar: React.FC<NavbarProps> = ({ userType }) => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navItems =
    userType === "customer"
      ? [
          { href: "/customer-dashboard", label: "Dashboard" },
          { href: "/customer-dashboard/completed", label: "Completed Requests" },
        ]
      : [
          { href: "/provider-dashboard", label: "Dashboard" },
          { href: "/provider-dashboard/completed", label: "Completed Requests" },
        ]

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">SewaGhar</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button onClick={handleSignOut} variant="ghost">
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

