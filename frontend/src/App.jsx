import React from "react"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./components/AuthProvider"

function Logout() {
  return <Navigate to="/login" />
}

function ResgisterAndLogout() {
  return <Register />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<ResgisterAndLogout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
