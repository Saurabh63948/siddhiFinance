"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "./components/pages/NavBar"
import Login from "./components/Login"
import AdminDashboard from "./components/AdminDashboard"
import UserDashboard from "./components/pages/UserDashboard"
import AddPersonForm from "./components/AddPersonForm"
import SignUp from "./components/SignUp"
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [people, setPeople] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true")
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true")
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })
  const navigate = useNavigate()

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("https://mfinancebackend.onrender.com/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPeople(res.data)
    } catch (err) {
      console.error("Failed to fetch customers", err)
    }
  }

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true"
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUser = localStorage.getItem("user")

    setIsAdmin(storedIsAdmin)
    setIsLoggedIn(storedIsLoggedIn)
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (storedIsLoggedIn && storedIsAdmin) {
      fetchCustomers()
    }
  }, [])

  const handleLoginToggle = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUser(null)
    localStorage.clear()
    navigate("/")
  }

  const handleCustomerLogin = (loggedInUser) => {
    setIsLoggedIn(true)
    setIsAdmin(loggedInUser.isAdmin || false)
    setUser(loggedInUser)
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("isAdmin", loggedInUser.isAdmin || false)
    localStorage.setItem("user", JSON.stringify(loggedInUser))
    localStorage.setItem("token", loggedInUser.token)

    if (loggedInUser.isAdmin) {
      fetchCustomers()
      navigate("/dashboard")
    } else {
      navigate("/my-account")
    }
  }

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} isAdmin={isAdmin} toggleLogin={handleLoginToggle} />
      <div style={{ paddingTop: "70px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mt-5 text-center">
                <h1>Welcome to Finance Manager</h1>
                <p>Manage your loans and payments efficiently</p>
                {!isLoggedIn && (
                  <div className="mt-4">
                    <a href="/login" className="btn btn-primary btn-lg me-2">
                      Login
                    </a>
                    <a href="/signup" className="btn btn-success btn-lg">
                      Sign Up
                    </a>
                  </div>
                )}
              </div>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login setLoggedInCustomer={handleCustomerLogin} />} />
          <Route
            path="/add"
            element={
              isLoggedIn && isAdmin ? (
                <AddPersonForm onAddPerson={(newCustomer) => setPeople([...people, newCustomer])} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn && isAdmin ? (
                <AdminDashboard people={people} setPeople={setPeople} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/my-account"
            element={isLoggedIn && !isAdmin && user ? <UserDashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<div className="text-center mt-5">404 - Page not found</div>} />
        </Routes>
      </div>
    </>
  )
}

export default App
