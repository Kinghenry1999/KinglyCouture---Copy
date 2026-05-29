import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utility/Api";
import "../styles/Login.css"; // Import custom styles

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.requiresRoleSelection) {
        setAvailableRoles(response.data.availableRoles);
        setTempEmail(email);
        setTempPassword(password);
        setShowRoleModal(true);
        setLoading(false);
      } else {
        login(response.data.token, response.data.user);
        if (response.data.user.role === 'admin' || response.data.user.role === 'super_admin') {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Login failed");
      } else if (err.request) {
        setError("Network error – please check if the server is running.");
      } else {
        setError(`An error occurred: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    setShowRoleModal(false);
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: tempEmail,
        password: tempPassword,
        requestedRole: selectedRole,
      });
      login(response.data.token, response.data.user);
      if (selectedRole === 'admin' || selectedRole === 'super_admin') {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed with selected role");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <Card className="login-card">
          <Card.Body>
            <h2 className="login-title">Welcome Back</h2>
            {error && <Alert variant="danger" className="login-alert">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" className="login-spinner" /> : "Sign In"}
              </Button>
            </Form>

            <div className="login-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Role Selection Modal */}
      <Modal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        centered
        className="role-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Choose Login Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This account has multiple roles. Please select how you want to log in:</p>
          <div className="role-buttons">
            {availableRoles.map(role => (
              <Button
                key={role}
                variant={role === 'admin' ? 'danger' : 'primary'}
                onClick={() => handleRoleSelect(role)}
                className="role-btn"
              >
                {role === 'admin' ? 'Admin' : role === 'super_admin' ? 'Super Admin' : 'User'}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Login;