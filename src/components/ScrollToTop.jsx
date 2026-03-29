// components/ScrollToTop.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (pathname !== lastPathname.current) {
      window.scrollTo(0, 0);
    }
    lastPathname.current = pathname;
  }, [pathname, hash]);

  return null;
}
