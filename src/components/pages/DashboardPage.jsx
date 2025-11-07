/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Collapse,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const DashboardPage = ({ people: externalPeople, setPeople: externalSetPeople, isHost }) => {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLateFeeModal, setShowLateFeeModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const today = moment().format("YYYY-MM-DD");

  const toggleDetails = (id) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  const openPaymentModal = (id) => {
    setCurrentUserId(id);
    setAmount("");
    setShowPaymentModal(true);
  };

  const openLateFeeModal = (id) => {
    setCurrentUserId(id);
    setAmount("");
    setShowLateFeeModal(true);
  };

  const handleAddPayment = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    


    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://myfinacebackend-2.onrender.com/api/customers/${currentUserId}/add-payment`,
        {
          date: today,
          amount: parsedAmount,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const updatedUser = res.data;
      const updatedList = (externalPeople || people).map((p) =>
        p._id === updatedUser._id ? updatedUser : p
      );

      if (externalSetPeople) externalSetPeople(updatedList);
      else setPeople(updatedList);

      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error adding payment:", error.response?.data || error.message);
      alert("Failed to add payment: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddLateFee = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `https://myfinacebackend-2.onrender.com/api/customers/${currentUserId}/add-late-fee`,
        {
          date: today,
          amount: Number(amount),
          reason: "Late payment",
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const updatedUser = res.data;
      const updatedList = (externalPeople || people).map((p) =>
        p._id === updatedUser._id ? updatedUser : p
      );

      if (externalSetPeople) externalSetPeople(updatedList);
      else setPeople(updatedList);

      setShowLateFeeModal(false);
    } catch (error) {
      console.error("Error adding late fee:", error.response?.data || error.message);
      alert("Failed to add late fee: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://myfinacebackend-2.onrender.com/api/customers", {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        setPeople(res.data);
      } catch (err) {
        console.error("Unauthorized or fetch error", err);
        navigate("/");
      }
    };

    if (isHost && !externalPeople) {
      fetchData();
    }
  }, [isHost, externalPeople, navigate]);

  const dataToRender = externalPeople || people;
 
  return (
    <div className="container mt-4 mb-5">
      <h4 className="mb-4">Customer Dashboard</h4>

      {dataToRender.map((user) => (
        <Card key={user._id} className="mb-3 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5 className="text-primary">{user.name}</h5>
                <p className="mb-1"><strong>Aadhaar:</strong> {user.aadhaarNumber}</p>
                <p className="mb-1"><strong>Loan:</strong> ₹{user.loanAmount}</p>
                <p className="mb-1"><strong>Interest Rate:</strong> {user.interestRatePercent}%</p>
                <p className="mb-1"><strong>Total Payable:</strong> ₹{user.totalPayableAmount}</p>
                <p className="mb-1"><strong>Remaining:</strong> ₹{user.remainingAmount}</p>
              </div>

              <div className="text-end mt-2">
                {isHost && (
                  <div className="mb-2 d-flex flex-column gap-1">
                    <Button size="sm" onClick={() => openPaymentModal(user._id)}>
                      Add Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => openLateFeeModal(user._id)}
                    >
                      Add Late Fee
                    </Button>
                  </div>
                )}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => toggleDetails(user._id)}
                >
                  {expandedUser === user._id ? "Hide Details" : "Show Details"}
                </Button>
              </div>
            </div>

            <Collapse in={expandedUser === user._id}>
              <div className="mt-3">
                <h6 className="text-secondary">Passbook</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.repaymentHistory || []).length > 0 ? (
                      user.repaymentHistory.map((entry, i) => (
                        <tr key={i}>
                          <td>{entry.date}</td>
                          <td className={entry.amountPaid === 0 ? "text-danger" : ""}>
                            ₹{entry.amountPaid}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted">
                          No payments yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <h6 className="text-secondary mt-3">Late Fees</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.fines || []).length > 0 ? (
                      user.fines.map((fee, i) => (
                        <tr key={i}>
                          <td>{fee.date}</td>
                          <td>₹{fee.amount}</td>
                          <td>{fee.reason}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No late fees recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPayment} disabled={!amount || loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Late Fee Modal */}
      <Modal show={showLateFeeModal} onHide={() => setShowLateFeeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Late Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Late Fee Amount</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter fee amount"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLateFeeModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleAddLateFee} disabled={!amount || loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Add Fee"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DashboardPage;
