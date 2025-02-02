import React from "react"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./components/AuthProvider"
import CreateAndEditDeck from "./pages/CreateAndEditDeck"
import Layout from "./components/Layout"
import Decks from "./pages/Decks"

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
          <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="/create" element={<CreateAndEditDeck mode="create"/>} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/edit-deck/:id" element={<CreateAndEditDeck mode="edit"/>} />
          </Route>
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
