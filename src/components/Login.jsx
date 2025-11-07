



import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./Login.css"

const Login = ({ setLoggedInCustomer }) => {
  const [step, setStep] = useState("mobile") // 'mobile' or 'otp'
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [testOTP, setTestOTP] = useState("")
  const navigate = useNavigate()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("https://https://myfinacebackend.onrender.com/api/auth/send-otp", {
        mobileNumber,
      })

      if (response.data.success) {
        setTestOTP(response.data.testOTP) // For testing
        setStep("otp")
        setError("")
      } else {
        setError(response.data.message || "Failed to send OTP")
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("https://https://myfinacebackend.onrender.com/api/auth/verify-otp", {
        mobileNumber,
        otp,
        isAdmin: false,
      })

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        setLoggedInCustomer({
          ...response.data.user,
          token: response.data.token,
        })

        navigate("/dashboard")
      } else {
        setError(response.data.message || "Failed to verify OTP")
      }
    } catch (err) {
      console.error("Error:", err)
      setError(err.response?.data?.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Finance Manager Login</h2>

        {step === "mobile" ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength="10"
                required
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="form-text mt-3">
              Don't have an account? <a href="/signup">Sign Up</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                className="form-control"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength="6"
                required
              />
              {testOTP && <small className="form-text text-muted">Test OTP: {testOTP}</small>}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              onClick={() => {
                setStep("mobile")
                setOtp("")
                setError("")
              }}
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
