import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Table, Form, Modal, Spinner } from "react-bootstrap";
import moment from "moment";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

const UserDetailsPage = ({ people, setPeople, isHost }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = people.find((p) => p._id === id);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLateFeeModal, setShowLateFeeModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  if (!user) {
    return <div className="text-center mt-5 text-danger">User not found</div>;
  }

  const updateUserInState = (updatedUser) => {
    const updatedPeople = people.map((p) => (p._id === id ? updatedUser : p));
    setPeople(updatedPeople);
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true); // Set loading to true

    try {
      const res = await fetch(`https://https://myfinacebackend.onrender.com/api/customers/${id}/add-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) }),
      });

      if (!res.ok) throw new Error("Failed to add payment");

      const updatedUser = await res.json();
      updateUserInState(updatedUser);
      alert("Payment added successfully.");
      setPaymentAmount("");
      setShowPaymentModal(false);
    } catch (err) {
      console.error("Failed to add payment:", err);
      alert("Failed to add payment.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleAddLateFee = async () => {
    if (!feeAmount || parseFloat(feeAmount) <= 0) {
      alert("Please enter a valid fee amount.");
      return;
    }

    setLoading(true); // Set loading to true

    try {
      const res = await fetch(`https://https://myfinacebackend.onrender.com/api/customers/${id}/add-late-fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(feeAmount),
          reason: "Late payment",
        }),
      });

      if (!res.ok) throw new Error("Failed to add late fee");

      const updatedUser = await res.json();
      updateUserInState(updatedUser);
      alert("Late fee added successfully.");
      setFeeAmount("");
      setShowLateFeeModal(false);
    } catch (err) {
      console.error("Failed to add late fee:", err);
      alert("Failed to add late fee.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const isValidPayment = paymentAmount && parseFloat(paymentAmount) > 0;
  const isValidFee = feeAmount && parseFloat(feeAmount) > 0;

  const totalPaid = (user.repaymentHistory || []).reduce((sum, r) => sum + r.amountPaid, 0);
  const totalFees = (user.fines || []).reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="container mt-4 mb-5">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="text-primary">{user.name}</h4>
          <p><strong>Aadhaar:</strong> {user.aadhaar}</p>
          <p><strong>Loan Amount:</strong> {formatCurrency(user.loanAmount || 0)}</p>
          <p><strong>Total Repayable:</strong> {formatCurrency(user.totalRepayable || 0)}</p>
          <p><strong>Remaining:</strong> {formatCurrency(user.remaining || 0)}</p>
          <p><strong>Total Paid:</strong> {formatCurrency(totalPaid)}</p>
          <p><strong>Total Late Fees:</strong> {formatCurrency(totalFees)}</p>

          {isHost && (
            <div className="d-flex gap-2 mt-3">
              <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                Add Payment
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => setShowLateFeeModal(true)}
              >
                Add Late Fee
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4">
        <h5 className="text-secondary">Passbook</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {(user.repaymentHistory || []).length > 0 ? (
              user.repaymentHistory.map((entry, idx) => (
                <tr key={idx}>
                  <td>{moment(entry.date).format("D MMM YYYY")}</td>
                  <td className={entry.amountPaid === 0 ? "text-danger" : ""}>
                    {formatCurrency(entry.amountPaid)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-muted">
                  <i>No payments made yet</i>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <h5 className="text-secondary mt-4">Late Fees</h5>
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
              user.fines.map((fee, idx) => (
                <tr key={idx}>
                  <td>{moment(fee.date).format("D MMM YYYY")}</td>
                  <td>{formatCurrency(fee.amount)}</td>
                  <td>{fee.reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  <i>No late fees recorded</i>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => {
          setPaymentAmount("");
          setShowPaymentModal(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setPaymentAmount("");
              setShowPaymentModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPayment}
            disabled={!isValidPayment || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Late Fee Modal */}
      <Modal
        show={showLateFeeModal}
        onHide={() => {
          setFeeAmount("");
          setShowLateFeeModal(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Late Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Late Fee Amount</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="Enter fee amount"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setFeeAmount("");
              setShowLateFeeModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleAddLateFee}
            disabled={!isValidFee || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Add Fee"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDetailsPage;
