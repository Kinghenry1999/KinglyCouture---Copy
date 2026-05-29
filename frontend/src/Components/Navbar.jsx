// src/Components/AppNavbar.jsx
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";   // new import
import "../styles/Navbar.css";

const AppNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCart();
  const { user, logout, isAdmin, isUser } = useAuth();
  const { wishlist } = useWishlist();   // get wishlist data

  const cartItemCount = cart.length;
  const wishlistCount = wishlist.length;

  // Pulse animation for cart badge
  useEffect(() => {
    const badge = document.querySelector('.cart-badge');
    if (badge && cartItemCount > 0) {
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 400);
    }
  }, [cartItemCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar expand="lg" fixed="top" className={`navbar-premium ${scrolled ? "scrolled" : ""}`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand-premium">
          Kingly Stores
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler-premium" />
        <Navbar.Collapse id="navbar-nav" className="navbar-collapse-premium">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-premium">Home</Nav.Link>
            <Nav.Link as={Link} to="/products" className="nav-link-premium">Products</Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link-premium">About</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link-premium">Contact</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center flex-wrap">
            {user ? (
              <>
                {isUser() && (
                  <>
                    {/* Wishlist Button */}
                    <Button as={Link} to="/wishlist" className="btn-nav-premium position-relative me-2">
                      Wishlist
                      {wishlistCount > 0 && (
                        <Badge bg="light" className="cart-badge ms-1">{wishlistCount}</Badge>
                      )}
                    </Button>
                    {/* Cart Button */}
                    <Button as={Link} to="/cart" className="btn-nav-premium position-relative">
                      Cart
                      {cartItemCount > 0 && (
                        <Badge bg="light" className="cart-badge ms-1">{cartItemCount}</Badge>
                      )}
                    </Button>
                  </>
                )}
                {isAdmin() && (
                  <Button as={Link} to="/dashboard" className="btn-nav-primary-premium ms-2">
                    Dashboard
                  </Button>
                )}
                <span className="welcome-text mx-2">Welcome, {user.name}</span>
                <Button onClick={logout} className="btn-nav-premium">Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" className="btn-nav-premium me-2">Login</Button>
                <Button as={Link} to="/register" className="btn-nav-primary-premium">Register</Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;