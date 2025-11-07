"use client";

import { useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = ({ people, setPeople }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");
  const [fineLoading, setFineLoading] = useState(false);

  const token = localStorage.getItem("token");

  // -------- Edit Logic ----------
  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setEditData(customer);
  };


  console.log(people,"uaefo")
  const handleSaveEdit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.put(
        `http://localhost:5000/api/customers/${editingId}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPeople(people.map((p) => (p._id === editingId ? response.data : p)));
      setEditingId(null);
      alert("Customer updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    setLoading(true);
    setError("");

    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPeople(people.filter((p) => p._id !== id));
      alert("Customer deleted successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  // -------- Offcanvas ----------
  const handleUserClick = (customer) => {
    setSelectedUser(customer);
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
    setSelectedUser(null);
    setPaymentAmount("");
    setFineAmount("");
    setFineReason("");
  };

  // -------- Payment Logic ----------
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setPaymentLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/customers/${selectedUser._id}/add-payment`,
        {
          amount: Number(paymentAmount),
          date: new Date().toISOString().split("T")[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedCustomer = response.data.customer;
      setSelectedUser(updatedCustomer);
      setPeople((prev) =>
        prev.map((p) => (p._id === updatedCustomer._id ? updatedCustomer : p))
      );
      setPaymentAmount("");
      alert("Payment added successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  // -------- Fine Logic ----------
  const handleAddFine = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFineLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/customers/${selectedUser._id}/add-fine`,
        {
          amount: Number(fineAmount),
          reason: fineReason,
          date: new Date().toISOString().split("T")[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response)
      const updatedCustomer = response.data.customer;
      setSelectedUser(updatedCustomer);
      setPeople((prev) =>
        prev.map((p) => (p._id === updatedCustomer._id ? updatedCustomer : p))
      );
      setFineAmount("");
      setFineReason("");
      alert("Fine added successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add fine");
    } finally {
      setFineLoading(false);
    }
  };

  // -------- JSX Return ----------
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Admin Dashboard - All Transactions</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Loan Amount</th>
              <th>Total Payable</th>
              <th>Paid Amount</th>
              <th>Remaining</th>
              <th>Interest %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((customer) => (
              <tr key={customer._id}>
                {editingId === customer._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    </td>
                    <td>{customer.mobileNumber}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editData.loanAmount}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            loanAmount: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editData.totalPayableAmount}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            totalPayableAmount: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editData.paidAmount}
                        onChange={(e) => {
                          const paid = Number(e.target.value);
                          setEditData({
                            ...editData,
                            paidAmount: paid,
                            remainingAmount:
                              editData.totalPayableAmount - paid,
                          });
                        }}
                      />
                    </td>
                    <td>{editData.remainingAmount}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editData.interestRatePercent}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            interestRatePercent: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={handleSaveEdit}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <span
                        className="text-primary"
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleUserClick(customer)}
                      >
                        {customer.name}
                      </span>
                    </td>
                    <td>{customer.mobileNumber}</td>
                    <td>₹{customer.loanAmount}</td>
                    <td>₹{customer.totalPayableAmount}</td>
                    <td>₹{customer.paidAmount}</td>
                    <td>₹{customer.remainingAmount}</td>
                    <td>{customer.interestRatePercent}%</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(customer._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Offcanvas ---------- */}
      <div
        className={`custom-offcanvas ${showOffcanvas ? "show" : ""}`}
        style={{ right: showOffcanvas ? "0" : "-500px" }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">
            <i className="bi bi-person-circle me-2"></i>{" "}
            {selectedUser?.name || "User Details"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseOffcanvas}
          ></button>
        </div>

        <div className="offcanvas-body">
          {selectedUser ? (
            <>
              {/* User Info */}
              <div className="user-info-card glass-card mb-4 p-3">
                <p><strong>📞 Mobile:</strong> {selectedUser.mobileNumber}</p>
                <p><strong>💰 Loan:</strong> ₹{selectedUser.loanAmount}</p>
                <p><strong>💸 Total Payable:</strong> ₹{selectedUser.totalPayableAmount}</p>
                <p><strong>✅ Paid:</strong> ₹{selectedUser.paidAmount}</p>
                <p><strong>🧾 Remaining:</strong> ₹{selectedUser.remainingAmount}</p>
                <p><strong>📈 Interest Rate:</strong> {selectedUser.interestRatePercent}%</p>
                {selectedUser.totalFine > 0 && (
                  <p className="text-danger fw-bold mt-2">
                    ⚠️ Total Fine: ₹{selectedUser.totalFine}
                  </p>
                )}
              </div>

              {/* Add Payment */}
              <div className="glass-card mb-4 p-3">
                <h6 className="fw-bold text-primary mb-3">Add Payment</h6>
                <form onSubmit={handleAddPayment}>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter payment amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="1"
                      max={selectedUser.remainingAmount}
                    />
                  </div>

                  <button
                    className="btn btn-primary w-100 rounded-pill shadow-sm"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? "Processing..." : "Submit Payment"}
                  </button>
                </form>
              </div>

              {/* Add Fine */}
              <div className="glass-card mb-4 p-3">
                <h6 className="fw-bold text-danger mb-3">Add Fine</h6>
                <form onSubmit={handleAddFine}>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter fine amount"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter reason (optional)"
                    value={fineReason}
                    onChange={(e) => setFineReason(e.target.value)}
                  />

                  <button
                    className="btn btn-danger w-100 rounded-pill shadow-sm"
                    disabled={fineLoading}
                  >
                    {fineLoading ? "Adding..." : "Add Fine"}
                  </button>
                </form>
              </div>

              {/* Payment History */}
              <div className="glass-card p-3">
                <h6 className="fw-bold text-secondary mb-3">
                  Payment & Fine History
                </h6>
                {selectedUser.repaymentHistory?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount Paid</th>
                          <th>Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.repaymentHistory.map((p, i) => (
                          <tr key={i}>
                            <td>{p.date}</td>
                            <td>₹{p.amountPaid}</td>
                            <td>{p.fine ? `₹${p.fine}` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center">
                    No payment history yet
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted text-center">No user selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
