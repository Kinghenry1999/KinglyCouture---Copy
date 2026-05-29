import { Container, Row, Col, Button } from "react-bootstrap";
import "../styles/Footer.css"; // Import the footer styles

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-premium">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-3 footer-section">
            <h5 className="footer-title">About Us</h5>
            <p className="footer-description">
              We provide quality products with unbeatable prices. Our mission is
              to make shopping effortless and enjoyable.
            </p>
          </Col>
          <Col md={4} className="mb-3 footer-section">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3 footer-section">
            <h5 className="footer-title">Subscribe</h5>
            <p className="footer-description">
              Get updates about our latest products and offers
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
              />
              <Button className="newsletter-btn">
                Subscribe
              </Button>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Kingly Stores. All rights reserved.
          </div>
          <div className="social-links">
            <Button variant="light" size="sm" className="social-btn">
              Fb
            </Button>
            <Button variant="light" size="sm" className="social-btn">
              Ig
            </Button>
            <Button variant="light" size="sm" className="social-btn">
              Tw
            </Button>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;