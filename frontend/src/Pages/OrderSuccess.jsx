// src/Pages/OrderSuccess.jsx
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <Container className="text-center mt-5">
      <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
        <Card.Body>
          <h2>Order Successful!</h2>
          <p>Thank you for your purchase. Your order has been placed successfully.</p>
          <p>You will receive an email confirmation shortly.</p>
          <Button as={Link} to="/products" variant="primary">Continue Shopping</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderSuccess;