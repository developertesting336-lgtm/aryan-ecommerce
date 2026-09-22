import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AppRoutes from './routes/AppRoutes.jsx';
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
  autoClose={2000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick={false}
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
  progressClassName="!bg-blue-600"
  iconClassName="!text-blue-600"
/>

   {/* </ThemeProvider> */}
    </Provider>

  </StrictMode>,
)
