"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./UserDashboard.css"

const UserDashboard = ({ user }) => {
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const fetchCustomerData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await axios.get(`http://localhost:5000/api/customers/by-mobile/${user.mobileNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setCustomerData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch customer data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    setPaymentLoading(true)
    setError("")

    try {
      const response = await axios.post(
        `http://localhost:5000/api/customers/${customerData._id}/add-payment`,
        {
          amount: Number(paymentAmount),
          date: new Date().toISOString().split("T")[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setCustomerData(response.data.customer)
      setPaymentAmount("")
      alert("Payment added successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add payment")
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>
  }

  if (!customerData) {
    return <div className="alert alert-warning mt-5">No customer data found</div>
  }

  return (
    <div className="user-dashboard">
      <h2 className="dashboard-title">My Account</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Loan Details</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Name:</strong> {customerData.name}
              </p>
              <p>
                <strong>Mobile:</strong> {customerData.mobileNumber}
              </p>
              <p>
                <strong>Loan Amount:</strong> ₹{customerData.loanAmount}
              </p>
              <p>
                <strong>Interest Rate:</strong> {customerData.interestRatePercent}%
              </p>
              <p>
                <strong>Total Payable:</strong> ₹{customerData.totalPayableAmount}
              </p>
              <p>
                <strong>Loan Start Date:</strong> {new Date(customerData.loanStartDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Duration:</strong> {customerData.durationInDays} days
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Payment Status</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Paid Amount:</strong> ₹{customerData.paidAmount}
              </p>
              <p>
                <strong>Remaining Amount:</strong> ₹{customerData.remainingAmount}
              </p>
              <div className="progress mb-3">
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{
                    width: `${(customerData.paidAmount / customerData.totalPayableAmount) * 100}%`,
                  }}
                >
                  {Math.round((customerData.paidAmount / customerData.totalPayableAmount) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Add Payment</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddPayment}>
            <div className="form-group mb-3">
              <label htmlFor="amount" className="form-label">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1"
                max={customerData.remainingAmount}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
              {paymentLoading ? "Processing..." : "Add Payment"}
            </button>
          </form>
        </div>
      </div> */}

      <div className="card">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">Payment History</h5>
        </div>
        <div className="card-body">
          {customerData.repaymentHistory && customerData.repaymentHistory.length > 0 ? (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {customerData.repaymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.date}</td>
                    <td>₹{payment.amountPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No payment history yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
