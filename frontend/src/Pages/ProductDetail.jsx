import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Form, Alert, ListGroup } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/Home.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
    // Check if user has a review
    if (user) {
      fetchUserReview();
    }
  }, [id, user]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserReview = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      const myReview = res.data.find(r => r.user_id === user.id);
      setUserReview(myReview);
      if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment || "");
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to write a review.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      fetchReviews();
      fetchUserReview();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      await api.delete(`/reviews/${userReview.id}`);
      setUserReview(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#e2e8f0' }}>★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="text-center mt-5">
        <h3>Product not found</h3>
        <Button as={Link} to="/products" variant="primary">Back to Products</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Card.Img
            src={getFullImageUrl(product.image)}
            alt={product.name}
            className="product-img-premium"
            style={{ maxHeight: "500px", objectFit: "contain" }}
            onError={(e) => { e.target.src = '/placeholder-image.png'; }}
          />
        </Col>
        <Col md={6}>
          <h1 className="product-title-premium">{product.name}</h1>
          <h3 className="product-price-premium">₦{(parseFloat(product.price) || 0).toFixed(2)}</h3>
          <p className="text-muted">Category: {product.category || "N/A"}</p>
          {product.average_rating > 0 && (
            <div className="mb-2">
              {renderStars(product.average_rating)} <span>({product.review_count} reviews)</span>
            </div>
          )}
          {product.quantity !== undefined && (
            <p className={product.quantity < 5 ? "text-danger" : "text-success"}>
              {product.quantity > 0 ? `In Stock: ${product.quantity}` : "Out of Stock"}
            </p>
          )}
          <div className="mb-3">
            <Button
              variant="primary"
              className="btn-cart-premium"
              onClick={() => addToCart(product.id, 1)}
              disabled={product.quantity === 0}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline-danger"
              className="btn-cart-premium ms-2"
              onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id)}
            >
              {isInWishlist(product.id) ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Reviews Section */}
      <Row className="mt-5">
        <Col md={8} offset={2}>
          <h3>Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review!</p>
          ) : (
            <ListGroup variant="flush">
              {reviews.map(review => (
                <ListGroup.Item key={review.id}>
                  <div className="d-flex justify-content-between">
                    <strong>{review.user_name}</strong>
                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                  <div>{renderStars(review.rating)}</div>
                  <p>{review.comment}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {/* Write a review */}
          {user && user.role === 'user' ? (
            <Card className="mt-4">
              <Card.Body>
                <h5>{userReview ? 'Edit Your Review' : 'Write a Review'}</h5>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmitReview}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Star{num > 1 && 's'}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Comment (optional)</Form.Label>
                    <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  {userReview && (
                    <Button variant="outline-danger" className="ms-2" onClick={handleDeleteReview}>Delete Review</Button>
                  )}
                </Form>
              </Card.Body>
            </Card>
          ) : !user ? (
            <Alert variant="info" className="mt-4">Please <Link to="/login">log in</Link> to write a review.</Alert>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;