// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);  // To handle loading state
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/profile"); // Redirect to profile if already logged in
//     }
//   }, [navigate]);

//   const validateForm = () => {
//     if (!email || !password) {
//       setError("Please fill in both fields.");
//       return false;
//     }

//     const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
//     if (!emailRegex.test(email)) {
//       setError("Please enter a valid email address.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setLoading(true);
//     axios
//       .post("http://localhost:5000/api/auth/login", { email, password })
//       .then((response) => {
//         setLoading(false);
//         if (response.data.success) {
//           // Save the JWT token to localStorage
//           localStorage.setItem("token", response.data.token);
//           navigate("/profile");  // Redirect to the profile page
//         } else {
//           setError(response.data.message);  // Display error message from the response
//         }
//       })
//       .catch((err) => {
//         setLoading(false);
//         console.error("Login error:", err);
//         if (err.response) {
//           setError(err.response.data.message || "An error occurred during login");
//         } else {
//           setError("Network error or timeout");
//         }
//       });

//     // Reset form fields
//     setEmail('');
//     setPassword('');
//   };

//   return (
//     <div className="login-container">
//       <div className="login-form">
//         <h2>Login</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label">Email address</label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               aria-describedby="emailHelp"
//             />
//             <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">Password</label>
//             <input
//               type="password"
//               className="form-control"
//               id="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button type="submit" className="btn btn-primary" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>

//           {error && <div className="alert alert-danger mt-2">{error}</div>}  {/* Display error message */}

//           <div className="form-text mt-3">Don't have an account?</div>
//         </form>

//         <a href="/signup" className="btn btn-link" aria-label="Go to sign-up page">Sign Up</a>
//       </div>
//     </div>
//   );
// };

// export default Login;



"use client"

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
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
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
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
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
