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

export function TestConnection(){

const checkConnection = async()=>{

try{

const res = await axios.get(
"http://localhost:3000/health"
);

console.log("rr",res.data.message);

}
catch(error){

console.log("Backend not connected");

}

};


return(
<button onClick={checkConnection}>
Check Backend
</button>
);

}


function App() {

  return (
    <>
      {/* <TestConnection /> */}
    <AppRoutes />
    
    </>
  )
}

export default App
