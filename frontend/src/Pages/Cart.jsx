// src/Pages/Cart.jsx
import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getFullImageUrl } from '../utility/imageUtils';   // <-- import

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, getTotal } = useCart();
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities({ ...quantities, [productId]: newQuantity });
    updateCartItem(productId, newQuantity);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Container className="text-center mt-5">
        <h3>Your cart is empty</h3>
        <Button as={Link} to="/products" variant="primary">Continue Shopping</Button>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '60px', marginBottom: '60px' }}>
      <h2 className="text-center mb-4">Shopping Cart</h2>
      <Row>
        <Col lg={8}>
          {cart.map((item) => (
            <Card key={item.product_id} className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <img
                      src={getFullImageUrl(item.image)}   // <-- use shared helper
                      alt={item.name}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col md={6}>
                    <h5>{item.name}</h5>
                    <p>₦{item.price}</p>
                  </Col>
                  <Col md={3}>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item.product_id, (quantities[item.product_id] || item.quantity) - 1)}
                      >
                        <FaMinus />
                      </Button>
                      <Form.Control
                        type="number"
                        value={quantities[item.product_id] || item.quantity}
                        onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                        min="1"
                        style={{ width: '60px', margin: '0 10px' }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(item.product_id, (quantities[item.product_id] || item.quantity) + 1)}
                      >
                        <FaPlus />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemove(item.product_id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5>Order Summary</h5>
              <p>Total: ₦{getTotal().toFixed(2)}</p>
              <Button variant="primary" onClick={handleCheckout} disabled={loading}>
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;