"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function AdminRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return currentUser && userRole === "admin" ? children : <Navigate to="/" />
}
