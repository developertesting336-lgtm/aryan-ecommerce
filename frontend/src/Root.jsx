import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";

export default function Root() {
  return (
    <ThemeProvider>
      <AppRoutes />

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!rounded-xl !shadow-lg !border border-slate-200 dark:border-gray-800 !bg-white dark:!bg-gray-800 !text-slate-800 dark:!text-gray-100 !px-3 !py-2 !min-h-0"
        bodyClassName="!text-xs sm:!text-sm !font-medium !text-slate-700 dark:!text-gray-200"
        progressClassName="!bg-blue-600"
        closeButton={true}
      />
    </ThemeProvider>
  );
}