import { useNavigate } from "react-router-dom";

export default function CallToAction({ variant = "cyan" }) {
  const navigate = useNavigate();

  const isWhite = variant === "white";

  return (
    <div className="flex gap-3 justify-center items-center flex-wrap">
      <button
        className={`rounded-lg py-3 px-6 text-base font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out font-brand hover:-translate-y-px ${isWhite
            ? "bg-white text-ht-cyan shadow-md hover:bg-gray-50"
            : "bg-ht-cyan text-white shadow-[0_4px_6px_-1px_rgba(0,180,216,0.2)] hover:bg-ht-cyan-light hover:shadow-[0_6px_10px_-1px_rgba(0,180,216,0.3)]"
          }`}
        onClick={() => navigate("/register")}
      >
        {isWhite ? "Start Free Today" : "Start Free"}
        <svg
          className="w-[18px] h-[18px] stroke-[2.5]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>

      <button
        className={`bg-transparent border-[1.5px] rounded-lg py-3 px-6 text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out font-brand hover:-translate-y-px ${isWhite
            ? "border-white text-white hover:bg-white/10"
            : "border-ht-cyan text-ht-cyan hover:bg-cyan-50"
          }`}
        onClick={() => navigate("/pro-features")}
      >
        Explore Pro Features
      </button>
    </div>
  );
}
