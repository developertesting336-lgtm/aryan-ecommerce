import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import AppRoutes from './routes/AppRoutes'
import { useDispatch, useSelector } from "react-redux";
import { getCart } from './redux/slices/cartSlice'
import axios from "axios";
import Navbar from './components/Header'




function App() {

  return (
    <>
      {/* <TestConnection /> */}
    <AppRoutes />
    
    </>
  )
}

export default App
