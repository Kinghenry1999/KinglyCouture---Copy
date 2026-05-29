import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Dropdown,
  Pagination,
  Spinner,
  Badge,
  Offcanvas,
} from "react-bootstrap";
import { BsHeart, BsHeartFill, BsFilter } from "react-icons/bs";
import { Link } from "react-router-dom";
import api from "../utility/Api";
import { CATEGORIES } from "../constants/Categories";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getFullImageUrl } from "../utility/imageUtils";
import "../styles/Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/posts");
        setProducts(response.data);
        const maxPrice = Math.max(...response.data.map(p => parseFloat(p.price) || 0));
        setPriceRange(prev => ({ ...prev, max: maxPrice || 1000 }));
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered = filtered.filter(p => {
      const price = parseFloat(p.price) || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
    }

    return filtered;
  }, [products, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#e2e8f0' }}>★</span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading exquisite products...</h4>
      </Container>
    );
  }

  return (
    <>
      <Container className="products-breadcrumb">
        <Link to="/">Home</Link> / Products
      </Container>

      <Container className="products-header">
        <Row className="align-items-center">
          <Col xs={6}>
            <h1 className="products-title">Our Collection</h1>
          </Col>
          <Col xs={6} className="text-end">
            <Button
              variant="outline-secondary"
              className="filter-toggle-btn d-md-none"
              onClick={() => setShowFilters(true)}
            >
              <BsFilter size={20} /> Filters
            </Button>
          </Col>
        </Row>
      </Container>

      <Container className="mb-5">
        <Row>
          <Col md={3} className="d-none d-md-block">
            <div className="filters-sidebar">
              <h5 className="filters-title">Filters</h5>
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Price Range (₦)</label>
                <Row>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      min={0}
                      className="filter-input price-range-input"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      min={0}
                      className="filter-input price-range-input"
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          <Col md={9}>
            <div className="products-grid">
              <div className="products-info">
                <span className="products-count">{filteredProducts.length} products found</span>
                <Dropdown align="end" className="sort-dropdown">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    Sort by
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSortBy("default")}>Default</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("price-asc")}>Price: Low to High</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("price-desc")}>Price: High to Low</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("name-asc")}>Name: A to Z</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy("name-desc")}>Name: Z to A</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <Row>
                {paginatedProducts.map((product) => (
                  <Col key={product.id} xs={12} sm={6} lg={4} className="mb-4">
                    <Card className="product-card">
                      <div className="product-image-wrapper">
                        <Card.Img
                          variant="top"
                          src={getFullImageUrl(product.image)}
                          className="product-image"
                          onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                        />
                        <button
                          className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                        >
                          {isInWishlist(product.id) ? <BsHeartFill /> : <BsHeart />}
                        </button>
                        {product.oldPrice && (
                          <Badge bg="danger" className="sale-badge">Sale</Badge>
                        )}
                      </div>
                      <Card.Body className="product-body">
                        <Card.Title className="product-title">{product.name || 'Unnamed Product'}</Card.Title>
                        <div className="product-price">₦{(parseFloat(product.price) || 0).toFixed(2)}</div>
                        {product.average_rating > 0 && (
                          <div className="product-rating">
                            <span className="stars">{renderStars(product.average_rating)}</span>
                            <span className="review-count">({product.review_count || 0})</span>
                          </div>
                        )}
                        <div className="product-actions">
                          <Button variant="outline-primary" className="btn-cart" onClick={() => addToCart(product.id, 1)}>
                            Add to Cart
                          </Button>
                          <Button variant="dark" className="btn-view" as={Link} to={`/product/${product.id}`}>
                            View
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <div className="products-pagination">
                  <Pagination className="pagination-custom">
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                    {[...Array(totalPages).keys()].map(num => (
                      <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
                        {num + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="no-products">
                  <p>No products match your criteria.</p>
                  <Button variant="link" onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange({ min: 0, max: Math.max(...products.map(p => parseFloat(p.price) || 0)) });
                    setSortBy("default");
                  }}>
                    Reset filters
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" className="offcanvas-premium">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Form.Select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Price Range (₦)</label>
            <Row>
              <Col xs={6}>
                <Form.Control type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))} min={0} className="filter-input" />
              </Col>
              <Col xs={6}>
                <Form.Control type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))} min={0} className="filter-input" />
              </Col>
            </Row>
          </div>
          <Button variant="primary" onClick={() => setShowFilters(false)} className="w-100 mt-3">
            Apply Filters
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Products;