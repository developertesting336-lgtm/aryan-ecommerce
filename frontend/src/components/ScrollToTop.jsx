import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * - Automatically scrolls to top smoothly whenever route pathname changes
 * - Also handles clicks on links that point to the current page so it scrolls to top
 * - Does NOT affect buttons for dropdowns, modals, tabs, filters, or cart/wishlist
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Scroll to top whenever pathname, search query, or hash changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname, search, hash]);

  // Handle clicking a link pointing to the page user is already on
  useEffect(() => {
    const handleSamePageLinkClick = (event) => {
      // Check if an anchor tag was clicked
      const anchor = event.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const currentPath = window.location.pathname;
      const currentFullUrl = currentPath + window.location.search;

      // If clicked link targets the current route, scroll smoothly to top
      if (href === currentPath || href === currentFullUrl || href === `${currentPath}#` || href === "#") {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    };

    document.addEventListener("click", handleSamePageLinkClick);
    return () => {
      document.removeEventListener("click", handleSamePageLinkClick);
    };
  }, []);

  return null;
}
