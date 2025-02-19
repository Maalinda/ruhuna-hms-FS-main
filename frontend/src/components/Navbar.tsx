import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      ref={navRef}
      className="bg-[#00695C] shadow-md fixed top-0 left-0 right-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="HMS Logo" className="h-16 w-auto" />
            <span className="text-white text-5xl font-bold">HMS</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/about"
              className={`text-white hover:text-accent transition-colors font-bold ${
                isActive("/about") ? "border-b-2 border-accent" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-white hover:text-accent transition-colors font-bold ${
                isActive("/contact") ? "border-b-2 border-accent" : ""
              }`}
            >
              Contact Us
            </Link>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="text-white h-5 w-5" />
                  <span className="text-white">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-accent text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className={`text-white hover:text-accent transition-colors font-bold ${
                    isActive("/register") ? "border-b-2 border-accent" : ""
                  }`}
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin"
                  className={`text-white hover:text-accent transition-colors font-bold ${
                    isActive("/admin") ? "border-b-2 border-accent" : ""
                  }`}
                >
                  Admin Login
                </Link>
                <Link
                  to="/login"
                  className={`bg-accent text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors font-bold ${
                    isActive("/login") ? "border-b-2 border-accent" : ""
                  }`}
                >
                  Login
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden text-white z-50 relative"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile expanding header */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-primary overflow-hidden"
          >
            <div className="flex flex-col items-center py-4 space-y-4">
              <Link
                to="/about"
                className={`text-white hover:text-accent transition-colors ${
                  isActive("/about") ? "border-b-2 border-accent" : ""
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-white hover:text-accent transition-colors ${
                  isActive("/contact") ? "border-b-2 border-accent" : ""
                }`}
              >
                Contact Us
              </Link>
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="text-white h-5 w-5" />
                    <span className="text-white">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-accent text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={`text-white hover:text-accent transition-colors ${
                      isActive("/register") ? "border-b-2 border-accent" : ""
                    }`}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/admin"
                    className={`text-white hover:text-accent transition-colors ${
                      isActive("/admin") ? "border-b-2 border-accent" : ""
                    }`}
                  >
                    Admin Login
                  </Link>
                  <Link
                    to="/login"
                    className={`bg-accent text-primary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors ${
                      isActive("/login") ? "border-b-2 border-accent" : ""
                    }`}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
