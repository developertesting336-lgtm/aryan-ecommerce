// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// const ThemeContext = createContext(null);

// export function ThemeProvider({ children }) {
//   const [darkMode, setDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem("theme");

//     if (savedTheme === "dark") {
//       return true;
//     }

//     if (savedTheme === "light") {
//       return false;
//     }

//     // First time user visits:
//     // use browser/system preference
//     return window.matchMedia(
//       "(prefers-color-scheme: dark)"
//     ).matches;
//   });

//   useEffect(() => {
//     const root = document.documentElement;

//     if (darkMode) {
//       root.classList.add("dark");
//       root.style.colorScheme = "dark";

//       localStorage.setItem("theme", "dark");
//     } else {
//       root.classList.remove("dark");
//       root.style.colorScheme = "light";

//       localStorage.setItem("theme", "light");
//     }
//   }, [darkMode]);

//   const toggleTheme = () => {
//     setDarkMode((prev) => !prev);
//   };

//   const setTheme = (theme) => {
//     setDarkMode(theme === "dark");
//   };

//   return (
//     <ThemeContext.Provider
//       value={{
//         darkMode,
//         theme: darkMode ? "dark" : "light",
//         toggleTheme,
//         setTheme,
//       }}
//     >
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export function useTheme() {
//   const context = useContext(ThemeContext);

//   if (!context) {
//     throw new Error(
//       "useTheme must be used inside ThemeProvider"
//     );
//   }

//   return context;
// }