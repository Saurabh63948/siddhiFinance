"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const SignUp = () => {
  const [step, setStep] = useState(1) // Step 1: Enter details, Step 2: Verify OTP
  const [name, setName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [testOTP, setTestOTP] = useState("") // For testing only
  const navigate = useNavigate()

  const validateMobileNumber = () => {
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.")
      return false
    }
    return true
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()

    if (!name || !mobileNumber) {
      setError("Name and mobile number are required.")
      return
    }

    if (!validateMobileNumber()) return

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        mobileNumber,
      })

      console.log(response,"efuweofhi")

      if (response.data.success) {
        setTestOTP(response.data.testOTP) // For testing only
        setStep(2) // Move to OTP verification step
        setError("")
      } else {
        setError(response.data.message || "Failed to send OTP.")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (!otp) {
      setError("Please enter the OTP.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        mobileNumber,
        otp,
        isAdmin: false, // New users are not admins
      })

      if (response.data.success) {
        // Store user data and token
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("isAdmin", "false")
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user.id,
            name: response.data.user.name,
            mobileNumber: response.data.user.mobileNumber,
            isAdmin: false,
            token: response.data.token,
          }),
        )
        localStorage.setItem("token", response.data.token)

        navigate("/my-account") // Redirect to user dashboard
      } else {
        setError(response.data.message || "OTP verification failed.")
      }
    } catch (err) {
      console.error(err)
      setError("OTP verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToStep1 = () => {
    setStep(1)
    setOtp("")
    setError("")
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Create Account</h2>

              {step === 1 ? (
                <form onSubmit={handleSendOTP}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                      required
                    />
                    <small className="form-text text-muted">We'll send an OTP to this number for verification.</small>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <p className="text-muted">
                      Already have an account?{" "}
                      <a href="/login" className="text-primary">
                        Login
                      </a>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="alert alert-info">
                    <small>
                      OTP has been sent to <strong>{mobileNumber}</strong>
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      required
                    />
                    <small className="form-text text-muted">{testOTP && `Test OTP: ${testOTP}`}</small>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button type="submit" className="btn btn-success w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP & Sign Up"
                    )}
                  </button>

                  <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={handleBackToStep1}>
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
