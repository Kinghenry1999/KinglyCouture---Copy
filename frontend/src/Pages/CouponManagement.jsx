import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import api from "../utility/Api";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrder: "",
    expiresAt: "",
    usageLimit: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/coupons", form);
      setShowModal(false);
      setForm({ code: "", discountType: "percentage", discountValue: "", minOrder: "", expiresAt: "", usageLimit: "" });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Coupon Codes</h5>
          <Button variant="success" onClick={() => setShowModal(true)}>Add Coupon</Button>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Used / Limit</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.code}</td>
                  <td>{c.discount_type}</td>
                  <td>{c.discount_value}</td>
                  <td>₦{c.min_order}</td>
                  <td>{c.used_count}/{c.usage_limit}</td>
                  <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "No expiry"}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Coupon</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control name="code" value={form.code} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Discount Type</Form.Label>
              <Form.Select name="discountType" value={form.discountType} onChange={handleChange}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Discount Value</Form.Label>
              <Form.Control name="discountValue" type="number" step="0.01" value={form.discountValue} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Minimum Order (₦)</Form.Label>
              <Form.Control name="minOrder" type="number" step="0.01" value={form.minOrder} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date (optional)</Form.Label>
              <Form.Control name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Usage Limit</Form.Label>
              <Form.Control name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Coupon"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CouponManagement;