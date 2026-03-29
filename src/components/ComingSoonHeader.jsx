import { Link } from "react-router-dom";

export default function ComingSoonHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-start px-6 py-4 bg-white shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-3">
        <img
          src="/assets/logo.png"
          alt="Home Truth Logo"
          className="w-42 h-11 cursor-pointer"
        />
      </Link>
    </header>
  );
}

