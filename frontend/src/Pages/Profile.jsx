// src/Pages/Profile.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";
import "../styles/Register.css"; // or create a separate Profile.css

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      if (user.profile_picture) {
        setPreview(getFullImageUrl(user.profile_picture));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Update profile info
      const res = await api.put("/auth/profile", formData);
      // Update auth context with new user data
      login(localStorage.getItem("token"), res.data.user);
      setSuccess("Profile updated successfully");

      // If a new picture was selected, upload it separately
      if (profilePicture) {
        const picFormData = new FormData();
        picFormData.append("profile_picture", profilePicture);
        // CORRECTED: no manual Content-Type header
        const picRes = await api.post("/auth/profile/picture", picFormData);
        login(localStorage.getItem("token"), {
          ...res.data.user,
          profile_picture: picRes.data.imageUrl,
        });
      }
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="register-card mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h2 className="register-title">My Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="text-center mb-3">
            {preview ? (
              <Image
                src={preview}
                roundedCircle
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
            ) : (
              <i className="bi bi-person-circle" style={{ fontSize: "4rem" }}></i>
            )}
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Update Profile"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;