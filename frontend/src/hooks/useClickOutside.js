import { useEffect, useRef } from "react";

/**
 * Custom hook to detect clicks/taps outside a referenced DOM element,
 * as well as handle the Escape key to close menus/dropdowns.
 *
 * @param {Function} handler - Callback to execute on outside click or Escape press
 * @param {boolean} [isActive=true] - Whether the listener should currently be active
 * @returns {React.RefObject} - Ref to attach to the dropdown/menu container
 */
export default function useClickOutside(handler, isActive = true) {
  const domNodeRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event) => {
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        handler(event);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handler(event);
      }
    };

    // Attach both mousedown and touchstart to support desktop and touch devices
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler, isActive]);

  return domNodeRef;
}
