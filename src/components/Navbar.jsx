"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Search, Menu, X, User, LogOut, Home, Settings } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "bg-[#821010]/75 backdrop-blur-sm shadow-md"
        : "bg-[#821010]"
        }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-yellow-400 text-4xl font-bold transition-transform group-hover:scale-105">ENG</span>
              <img
                src="/images/logo_copy.png"
                alt="Student Accommodation Logo"
                className="h-16 w-auto transition-transform group-hover:scale-105"
              />
              <span className="text-yellow-400 text-4xl font-bold transition-transform group-hover:scale-105">HMS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition-all w-36 focus:w-48"
              />
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-white hover:text-yellow-400 transition-colors relative ${isActive("/") ? "font-medium" : ""
                  }`}
              >
                <span>Home</span>
                {isActive("/") && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
                )}
              </Link>

              {currentUser ? (
                <>
                  {userRole === "administrator" ? (
                    <Link
                      to="/admin"
                      className={`text-white hover:text-yellow-400 transition-colors relative ${isActive("/admin") ? "font-medium" : ""
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        <Settings size={16} />
                        Admin
                      </span>
                      {isActive("/admin") && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={`text-white hover:text-yellow-400 transition-colors relative ${isActive("/dashboard") ? "font-medium" : ""
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        <Home size={16} />
                        Dashboard
                      </span>
                      {isActive("/dashboard") && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
                      )}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-yellow-400 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-white hover:text-yellow-400 transition-colors relative ${isActive("/login") ? "font-medium" : ""
                      }`}
                  >
                    <span>Login</span>
                    {isActive("/login") && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full"></span>
                    )}
                  </Link>

                  <Link
                    to="/register"
                    className="bg-yellow-400 hover:bg-yellow-500 text-[#821010] px-4 py-1.5 rounded-full font-medium transition-all hover:shadow-lg active:scale-95"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-yellow-400 hover:bg-yellow-500 text-[#821010] rounded-full p-2 transition-colors active:scale-95"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-transparent bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition-all"
                />
              </div>

              <Link
                to="/"
                className="text-white hover:text-yellow-400 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Home size={18} />
                  Home
                </span>
              </Link>

              {currentUser ? (
                <>
                  {userRole === "admin" ? (
                    <Link
                      to="/admin"
                      className="text-white hover:text-yellow-400 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <Settings size={18} />
                        Admin Dashboard
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="text-white hover:text-yellow-400 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <User size={18} />
                        My Dashboard
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-yellow-400 text-left px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors w-full"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut size={18} />
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-yellow-400 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <User size={18} />
                      Login
                    </span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-yellow-400 hover:bg-yellow-500 text-[#821010] px-4 py-2 rounded-md font-medium transition-all hover:shadow-md text-center"
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
  );
}
