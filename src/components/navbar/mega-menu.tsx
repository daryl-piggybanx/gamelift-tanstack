"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"

import { Search, User, ShoppingBag, ArrowLeft, ArrowRight, Menu, X } from "lucide-react"
import { cn } from "~/lib/utils"
import { menuItems, mobileMenuItems } from "./mock-data"
import logo from '~/assets/Logo-Bolt-White.png'
import { Link } from "@tanstack/react-router"
import { SignOutButton } from '@clerk/tanstack-react-start'

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mega-menu-container')) {
        setActiveMenu(null)
      }
    }

    if (activeMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMenu])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-black/50 shadow-md" : "bg-transparent",
        )}
      >
        {/* Top Announcement Bar */}
        <div className="bg-black text-white text-center text-xs font-medium py-2 uppercase tracking-wider">
          {/* Subscribers Get Free Shipping */}
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          {/* Left Slot - Empty on mobile, Announcement on desktop */}
          {/* <div className="hidden lg:flex items-center justify-start flex-1">
          </div> */}

          {/* Center Slot - Logo */}
          <div className="flex-1 flex items-center justify-end lg:flex-grow">
            <img
              src={logo}
              alt="PiggyBanx Logo"
              className={cn("h-12 w-auto", isScrolled ? "" : "")}
            />
          </div>

          {/* Right Slot - Navigation */}
          <div className="flex-1 flex items-center justify-end">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center bg-red-500 text-white rounded-full px-2 py-1 mega-menu-container">
              <div className="flex items-center space-x-1">
                {menuItems.map((item) => (
                  <div
                    key={item.title}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      className="text-sm font-medium tracking-wide hover:bg-white/10 hover:text-white rounded-full px-4 py-2"
                      onClick={() => setActiveMenu(activeMenu === item.title ? null : item.title)}
                    >
                      {item.title}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-1 pl-2">
                <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                <div
                  className="relative"
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-white/10 rounded-full"
                    onClick={() => setActiveMenu(activeMenu === "User" ? null : "User")}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
            </nav>

            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-red-600">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full p-0 bg-white">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center py-6 px-6 border-b">
                      <Link to="/">
                        <img src={logo} alt="PiggyBanx Logo" width={120} height={40} className="h-8 w-auto" />
                      </Link>
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button> */}
                    </div>
                    <div className="flex-1 px-6 py-8">
                      {mobileMenuItems.map((item) => (
                        <div key={item} className="py-4">
                          <Link
                            to={item === "Streams" ? "/streams" : item === "Leaderboard" ? "/leaderboard" : "/shop"}
                            className={`block text-lg font-medium ${
                              item === "Streams"
                                ? "text-red-500"
                                : item === "Leaderboard"
                                  ? "text-gray-400"
                                  : "text-black"
                            } ${
                              ["Streams", "Leaderboard", "Shop"].includes(item)
                                ? "flex items-center justify-between"
                                : ""
                            }`}
                          >
                            {item}
                            {["Streams", "Leaderboard"].includes(item) && (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="bg-red-500 text-white p-4 flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-black"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex space-x-4">
                        <Button variant="ghost" size="icon" className="text-white">
                          <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white">
                          <User className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white">
                          <ShoppingBag className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {activeMenu && activeMenu !== "User" && (
          <div
            className="hidden lg:block absolute top-full right-8 bg-white text-black shadow-lg w-80 z-50 mega-menu-container"
          >
            <div className="p-6">
              {menuItems
                .find((item) => item.title === activeMenu)
                ?.submenu.map((subItem) => (
                  <div key={subItem} className="py-2">
                    <a
                      href="#"
                      className={`block text-sm hover:text-gray-600 transition-colors ${
                        subItem === "Stream 1"
                          ? "text-red-500 font-medium"
                          : subItem === "Stream 2"
                            ? "text-gray-400"
                            : ""
                      } ${
                        ["Stream 1", "Stream 2", "Stream 3", "Stream 4", "Stream 5", "Stream 6", "Stream 7", "Stream 8", "Stream 9", "Stream 10"].includes(subItem)
                          ? "flex items-center justify-between"
                          : ""
                      }`}
                    >
                      {subItem}
                      {["Stream 1", "Stream 2", "Stream 3", "Stream 4", "Stream 5", "Stream 6", "Stream 7", "Stream 8", "Stream 9", "Stream 10"].includes(subItem) && (
                        <ArrowRight className="h-3 w-3" />
                      )}
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* User Menu Dropdown */}
        {activeMenu === "User" && (
          <div
            className="hidden lg:block absolute top-full right-8 bg-white text-black shadow-lg w-48 z-50 mega-menu-container"
          >
            <div className="p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2 px-2 py-1.5">
                My Account
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="py-1">
                <a
                  href="#"
                  className="block px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Profile
                </a>
              </div>
              <div className="py-1">
                <a
                  href="#"
                  className="block px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Settings
                </a>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="py-1">
                <SignOutButton>
                  <span className="block px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer">
                    Sign out
                  </span>
                </SignOutButton>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="h-[116px]" />
    </>
  )
}
