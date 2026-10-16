import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({
  className = "",
  size = 20,
  showLabel = false,
  variant = "icon", // "icon" | "pill" | "row"
}) {
  const { darkMode, toggleTheme } = useTheme();

  const labelText = darkMode ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={labelText}
        title={labelText}
        className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary ${
          darkMode
            ? "text-gray-200 hover:bg-gray-800/80 active:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100/80 active:bg-gray-100"
        } ${className}`}
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              darkMode
                ? "bg-amber-400/15 text-amber-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {darkMode ? (
              <Sun size={18} className="transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon size={18} className="transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </span>
          <span className="font-medium">
            {darkMode ? "Dark Theme" : "Light Theme"}
          </span>
        </span>

        {/* Pill switch indicator */}
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
            darkMode ? "bg-app-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
              darkMode ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {darkMode ? (
              <Sun size={12} className="text-amber-500" />
            ) : (
              <Moon size={12} className="text-slate-700" />
            )}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={labelText}
      title={labelText}
      className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 ${
        darkMode
          ? "border-gray-700 bg-gray-800 text-amber-400 hover:border-amber-400/50 hover:bg-gray-750 hover:text-amber-300 shadow-sm"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400/60 hover:bg-blue-50 hover:text-app-primary shadow-sm"
      } ${className}`}
    >
      <span className="sr-only">{labelText}</span>
      {darkMode ? (
        <Sun
          size={size}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
        />
      ) : (
        <Moon
          size={size}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
        />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {darkMode ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
