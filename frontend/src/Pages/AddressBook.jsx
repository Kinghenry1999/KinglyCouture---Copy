import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, ListGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../utility/Api";

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    is_default: false,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data);
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAdd = () => {
    setEditingAddress(null);
    setFormData({
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Nigeria",
      is_default: false,
    });
    setShowModal(true);
  };

  const openEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "Nigeria",
      is_default: address.is_default || false,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, formData);
        toast.success("Address updated");
      } else {
        await api.post("/addresses", formData);
        toast.success("Address added");
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted");
      fetchAddresses();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const setDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to update default address");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Addresses</h2>
        <Button variant="primary" onClick={openAdd}>
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p>No addresses saved yet.</p>
      ) : (
        <ListGroup>
          {addresses.map((addr) => (
            <ListGroup.Item key={addr.id} className="d-flex justify-content-between align-items-start">
              <div>
                <strong>{addr.address_line1}{addr.address_line2 ? ", " + addr.address_line2 : ""}</strong><br />
                {addr.city}, {addr.state} {addr.postal_code}<br />
                {addr.country}
                {addr.is_default && <span className="badge bg-success ms-2">Default</span>}
              </div>
              <div>
                <Button variant="outline-secondary" size="sm" onClick={() => openEdit(addr)}>Edit</Button>
                <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(addr.id)}>Delete</Button>
                {!addr.is_default && (
                  <Button variant="outline-success" size="sm" className="ms-2" onClick={() => setDefault(addr.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAddress ? "Edit Address" : "Add Address"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Address Line 1</Form.Label>
              <Form.Control
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address Line 2</Form.Label>
              <Form.Control
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              type="checkbox"
              label="Set as default address"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitLoading}>
              {submitLoading ? <Spinner animation="border" size="sm" /> : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AddressBook;