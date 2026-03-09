import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Pages/Share/Navbar'
import Footer from '../Pages/Share/Footer'
import Chatbot from '../components/Chatbot'

const Main = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
      <Chatbot />
    </div>
  )
}

export default Main
