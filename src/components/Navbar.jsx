import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "How it works", path: "/#how-it-works" },
    { label: "Home Truths", path: "/home-truths" },
    { label: "Privacy", path: "/privacy-policy" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm font-gill">
      <div className="flex justify-between gap-10 px-3 py-4 max-w mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 transition-opacity hover:opacity-90">
          <img
            src="/assets/logo.png"
            alt="Home Truth Logo"
            className="w-32 md:w-36 h-auto cursor-pointer"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-8 text-base text-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="hover:text-myblue font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/pro-features"
            className="border-2 border-[#00bfff] text-[#00bfff] hover:bg-[#00bfff] hover:text-white px-2 py-1 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Explore Pro Features
          </Link>

          <Link
            to="/login"
            className="bg-[#00bfff] hover:bg-blue-[#00bfff] text-white px-4 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Log in
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hamburger-btn lg:hidden text-gray-600 hover:text-myblue transition-colors focus:outline-none p-2 rounded-md hover:bg-gray-50"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-3xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl overflow-hidden animate-in slide-in-from-top duration-300 z-50"
        >
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-left px-4 py-4 text-lg font-semibold text-gray-700 hover:bg-blue-50 hover:text-myblue rounded-xl transition-all flex items-center justify-between group"
              >
                {link.label}
                <span className="material-symbols-outlined text-gray-300 group-hover:text-myblue transition-transform group-hover:translate-x-1">
                  chevron_right
                </span>
              </Link>
            ))}
            <div className="pt-4 px-4 pb-2 space-y-3">
              <button
                onClick={() => {
                  navigate("/pro-features");
                  setIsMenuOpen(false);
                }}
                className="w-full border-2 border-[#00bfff] text-[#00bfff] py-4 rounded-xl font-medium text-lg hover:bg-blue-50 transition-all active:scale-[0.98]"
              >
                Explore Pro Features
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#00bfff] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-500 transition-all active:scale-[0.98]"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

