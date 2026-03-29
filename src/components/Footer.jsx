import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const sections = [
    {
      heading: "Product",
      links: ["Pricing", "Pro Features"],
    },
    {
      heading: "Company",
      links: ["About", "FAQ", "Contact"],
    },
    {
      heading: "Legal",
      links: ["Privacy Policy", "Terms of Service"],
    },
  ];

  const getLinkHref = (link) => {
    switch (link) {
      case "Pricing":
        return "/pricing";
      case "Pro Features":
        return "/pro-features";
      case "About":
        return "/about";
      case "FAQ":
        return "/faq";
      case "Contact":
        return "mailto:admin@hometruth.io";
      case "Privacy Policy":
        return "/privacy-policy";
      case "Terms of Service":
        return "/terms-of-service";
      default:
        return "#";
    }
  };

  if (user) {
    return (
      <footer className="bg-[#0a1220] text-white flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-4 pb-4 border-t border-gray-800 flex justify-center">
          <p className="text-gray-500 text-xs">
            © 2026 HomeTruth. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0a1220] text-white pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6 py-5 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-10">
          {/* Logo Column */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-4">
              <img
                src="assets/HOME_TRUTH_POS_F 2 (3).png"
                alt="HomeTruth Logo"
                className="w-40 h-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[240px]">
              Real answers for every property decision.
            </p>
          </div>

          {/* Links Columns */}
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-medium text-md mb-2">
                {section.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    {getLinkHref(link).startsWith("mailto:") ? (
                      <a
                        href={getLinkHref(link)}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {link}
                      </a>
                    ) : (
                      <Link
                        to={getLinkHref(link)}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider and Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex justify-center">
          <p className="text-gray-500 text-xs">
            © 2026 HomeTruth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
