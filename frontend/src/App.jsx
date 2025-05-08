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
import TestDeck from "./pages/TestDeck"
import Settingslayout from "./components/SettingsLayout"
import GeneralSettings from "./pages/GeneralSettings"

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
          <Route element={<ProtectedRoute><Settingslayout/></ProtectedRoute>}>
            <Route path="/settings" element={<GeneralSettings />} />
            <Route path="/settings/general" element={<GeneralSettings />} />
          </Route>
          <Route path="/test/:id" element={<ProtectedRoute><TestDeck mode="test"/></ProtectedRoute>} />
          <Route path="/review/:id" element={<ProtectedRoute><TestDeck mode="review"/></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
