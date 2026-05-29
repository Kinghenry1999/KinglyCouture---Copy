import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";
import { useCart } from "../context/CartContext";
import "../styles/Home.css";

const CategoryProducts = () => {
  const { category } = useParams(); // from route /category/:category
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(`/posts/category/${encodeURIComponent(category)}`);
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="section-title-premium">{category} Products</h2>
      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="product-card-premium">
                <Card.Img
                  variant="top"
                  src={getFullImageUrl(product.image)}
                  className="product-img-premium"
                  onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-title-premium">{product.name}</Card.Title>
                  <Card.Text className="product-price-premium">₦{(parseFloat(product.price) || 0).toFixed(2)}</Card.Text>
                  <div className="d-flex gap-2 mt-auto">
                    <Button variant="outline-primary" className="btn-cart-premium flex-fill" onClick={() => addToCart(product.id, 1)}>
                      Add to Cart
                    </Button>
                    <Button variant="dark" className="btn-cart-premium flex-fill" as={Link} to={`/product/${product.id}`}>
                      View
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CategoryProducts;