import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getFullImageUrl } from "../utility/imageUtils";

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Container className="text-center mt-5">
        <h3>Your wishlist is empty</h3>
        <Button as={Link} to="/products" variant="primary">Continue Shopping</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Wishlist</h2>
      <Row>
        {wishlist.map((item) => (
          <Col key={item.product_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="product-card-premium">
              <Card.Img variant="top" src={getFullImageUrl(item.image)} className="product-img-premium" onError={(e) => { e.target.src = '/placeholder-image.png'; }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="product-title-premium">{item.name}</Card.Title>
                <Card.Text className="product-price-premium">₦{(parseFloat(item.price) || 0).toFixed(2)}</Card.Text>
                <div className="d-flex gap-2 mt-auto">
                  <Button variant="outline-primary" className="btn-cart-premium flex-fill" onClick={() => addToCart(item.product_id, 1)}>
                    Add to Cart
                  </Button>
                  <Button variant="outline-danger" className="btn-cart-premium flex-fill" onClick={() => removeFromWishlist(item.product_id)}>
                    Remove
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default WishlistPage;