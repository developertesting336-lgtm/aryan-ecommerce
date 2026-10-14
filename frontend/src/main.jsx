import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AppRoutes from './routes/AppRoutes';
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";

// import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
    <Provider store={store}>

{/* <App /> */}
{/* <ThemeProvider> */}
        <AppRoutes />
        {/* <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
      }}
    /> */}
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
  theme="light"
  toastClassName="!rounded-xl !shadow-lg !border !border-slate-200 !bg-white !text-slate-800 !px-3 !py-2 !min-h-0"
  bodyClassName="!text-xs sm:!text-sm !font-medium !text-slate-700"
  progressClassName="!bg-blue-600"
  closeButton={true}
/>

   {/* </ThemeProvider> */}
    </Provider>

  </StrictMode>,
)
