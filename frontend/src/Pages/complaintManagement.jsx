// src/Pages/ComplaintManagement.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../utility/Api";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.admin_response || "");
    setShowModal(true);
  };

  const submitResponse = async () => {
    if (!responseText.trim()) {
      setMessage({ type: "error", text: "Please enter a response" });
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/complaints/${selectedComplaint.id}/respond`, { response: responseText });
      setMessage({ type: "success", text: "Response sent successfully" });
      fetchComplaints();
      setShowModal(false);
      setSelectedComplaint(null);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to send response" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      setMessage({ type: "success", text: "Complaint deleted" });
      fetchComplaints();
    } catch (err) {
      setMessage({ type: "error", text: "Delete failed" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div>Loading complaints...</div>;

  return (
    <Container fluid>
      {message && (
        <Alert variant={message.type === "success" ? "success" : "danger"} className="mb-3">
          {message.text}
        </Alert>
      )}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Customer Complaints</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.message.substring(0, 50)}...</td>
                  <td>
                    <span className={`badge bg-${c.status === 'pending' ? 'warning' : 'success'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleRespond(c)}>
                      Respond
                    </Button>
                    <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(c.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No complaints yet.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Response Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Respond to Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <>
              <p><strong>From:</strong> {selectedComplaint.name} ({selectedComplaint.email})</p>
              <p><strong>Message:</strong></p>
              <div className="bg-light p-3 rounded mb-3">{selectedComplaint.message}</div>
              {selectedComplaint.admin_response && (
                <div className="mb-3">
                  <strong>Previous Response:</strong>
                  <div className="bg-light p-3 rounded">{selectedComplaint.admin_response}</div>
                </div>
              )}
              <Form.Group>
                <Form.Label>Your Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={submitResponse} disabled={actionLoading}>
            {actionLoading ? "Sending..." : "Send Response"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ComplaintManagement;