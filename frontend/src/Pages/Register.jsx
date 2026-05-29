import { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utility/Api";
import "../styles/Register.css"; // Import custom styles

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
      };

      if (adminKey.trim()) {
        payload.role = 'admin';
        payload.adminKey = adminKey.trim();
      }

      const response = await api.post("/auth/register", payload);

      if (response.status === 201) {
        login(response.data.token, response.data.user);
        setSuccess("Registration successful! Please check your email for verification code.");
        setTimeout(() => navigate("/verify-email", { state: { email } }), 2000);
      } else {
        setError(response.data?.message || "Registration failed. Try again.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || "Server error");
      } else if (err.request) {
        setError("Network error – please check if the server is running.");
      } else {
        setError(`An error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="register-title">Create Account</h2>

          {error && <Alert variant="danger" className="register-alert danger">{error}</Alert>}
          {success && <Alert variant="success" className="register-alert success">{success}</Alert>}

          <Form onSubmit={handleSubmit} className="register-form">
            <Form.Group className="form-group">
              <Form.Label className="form-label">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Admin Registration Key <span className="text-muted">(optional)</span></Form.Label>
              <Form.Control
                type="password"
                placeholder="Leave blank for regular user"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
              <Form.Text className="form-text">
                Only fill this if you have the admin secret key.
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" className="register-spinner" /> : "Sign Up"}
            </Button>
          </Form>

          <div className="register-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;