"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Search, Menu, X } from "lucide-react"

export default function Navbar() {
  const { currentUser, logout, userRole } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <header className="bg-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="Student Accommodation Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
              />
            </div>

            {currentUser ? (
              <>
                {userRole === "admin" && (
                  <Link to="/admin" className="text-[#4a2d5f] hover:text-[#3a2249]">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="text-[#4a2d5f] hover:text-[#3a2249]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[#4a2d5f] hover:text-[#3a2249]">
                  Login
                </Link>
                <Link to="/register" className="text-[#4a2d5f] hover:text-[#3a2249]">
                  Register
                </Link>
              </>
            )}

            <button className="bg-[#4a2d5f] text-white rounded-full p-2">
              <Menu size={24} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-[#4a2d5f] text-white rounded-full p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a2d5f] focus:border-transparent"
                />
              </div>

              {currentUser ? (
                <>
                  {userRole === "admin" && (
                    <Link
                      to="/admin"
                      className="text-[#4a2d5f] hover:text-[#3a2249]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-[#4a2d5f] hover:text-[#3a2249] text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[#4a2d5f] hover:text-[#3a2249]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-[#4a2d5f] hover:text-[#3a2249]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
