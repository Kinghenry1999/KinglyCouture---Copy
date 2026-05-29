// src/Pages/Home.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Carousel, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTruck, FaShieldAlt, FaHeadset, FaUndo, FaStar, FaStarHalfAlt, FaRegStar, FaRuler } from "react-icons/fa";
import api from "../utility/Api";
import { useCart } from "../context/CartContext";
import { getFullImageUrl } from "../utility/imageUtils";
import "../styles/Home.css";

const Home = () => {
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const [complaintData, setComplaintData] = useState({ name: "", email: "", message: "" });
  const [complaintStatus, setComplaintStatus] = useState({ success: false, error: false });

  // ✅ FIXED: scroll listener inside useEffect
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.querySelector('.back-to-top-premium');
      if (!btn) return;
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const productsRes = await api.get("/posts");
        const products = productsRes.data;
        setAllProducts(products);

        const featured = products.filter(p => p.featured);
        setFeaturedProducts(featured.slice(0, 8));

        const sorted = [...products].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : 0;
          const dateB = b.created_at ? new Date(b.created_at) : 0;
          return dateB - dateA;
        });
        setNewArrivals(sorted.slice(0, 8));

        const blogRes = await api.get("/blog");
        setBlogPosts(blogRes.data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowBlogModal(true);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setComplaintStatus({ success: false, error: false });
    try {
      await api.post("/complaints", complaintData);
      setComplaintStatus({ success: true, error: false });
      setComplaintData({ name: "", email: "", message: "" });
      setTimeout(() => setComplaintStatus({ success: false, error: false }), 5000);
    } catch (err) {
      console.error("Complaint submission error:", err);
      setComplaintStatus({ success: false, error: true });
      setTimeout(() => setComplaintStatus({ success: false, error: false }), 5000);
    }
  };

  const categories = [
    { id: 1, name: "Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", slug: "shoes" },
    { id: 2, name: "Nigerian Senator Wears", image: "https://images.unsplash.com/photo-1445205170230-053b83016050", slug: "senator-wears" },
    { id: 3, name: "Suits", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf", slug: "suits" },
    { id: 4, name: "Casual Wears", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f", slug: "casual-wears" },
    { id: 5, name: "Accessories", image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93", slug: "accessories" },
    { id: 6, name: "Bags", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601", slug: "bags" },
  ];

  const testimonials = [
    { id: 1, name: "Sarah M.", text: "Amazing quality and fast shipping! I'm a repeat customer.", rating: 5, image: "https://randomuser.me/api/portraits/women/44.jpg", date: "March 2025" },
    { id: 2, name: "James T.", text: "The customer support team went above and beyond to help me.", rating: 5, image: "https://randomuser.me/api/portraits/men/32.jpg", date: "February 2025" },
    { id: 3, name: "Emily R.", text: "Products are exactly as described. Will definitely shop again.", rating: 4, image: "https://randomuser.me/api/portraits/women/68.jpg", date: "January 2025" },
    { id: 4, name: "Michael O.", text: "Best prices in town! The quality is unbeatable.", rating: 5, image: "https://randomuser.me/api/portraits/men/75.jpg", date: "March 2025" },
  ];

  const brands = [
    { id: 1, name: "Gucci", logo: "https://via.placeholder.com/150x80?text=Gucci" },
    { id: 2, name: "Armani", logo: "https://via.placeholder.com/150x80?text=Armani" },
    { id: 3, name: "Hugo Boss", logo: "https://via.placeholder.com/150x80?text=Hugo+Boss" },
    { id: 4, name: "Ralph Lauren", logo: "https://via.placeholder.com/150x80?text=Ralph+Lauren" },
    { id: 5, name: "Tom Ford", logo: "https://via.placeholder.com/150x80?text=Tom+Ford" },
    { id: 6, name: "Versace", logo: "https://via.placeholder.com/150x80?text=Versace" },
  ];

  const instaPosts = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "https://images.unsplash.com/photo-1503602642458-232111445657",
    "https://images.unsplash.com/photo-1545128485-c400e7702796",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<FaStar key={i} className="text-warning" />);
      else if (i - rating < 1 && rating % 1 !== 0) stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      else stars.push(<FaRegStar key={i} className="text-warning" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <h3>Loading...</h3>
      </Container>
    );
  }

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <div className="hero-premium" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8')" }}>
        <div className="hero-overlay-premium">
          <h1 className="hero-title-premium">Welcome to Kingly Stores</h1>
          <p className="hero-subtitle-premium">Discover quality products at the best prices – curated just for you.</p>
          <Button className="btn-hero" as={Link} to="/products">Shop Now</Button>
        </div>
      </div>

      {/* ================= NEW ARRIVALS ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">New Arrivals</h2>
        <Row>
          {newArrivals.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="product-card-premium">
                <Card.Img variant="top" src={getFullImageUrl(product.image)} className="product-img-premium" onError={(e) => { e.target.src = '/placeholder-image.png'; }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-title-premium">{product.name}</Card.Title>
                  <Card.Text className="product-price-premium">₦{(parseFloat(product.price) || 0).toFixed(2)}</Card.Text>
                  <div className="d-flex gap-2 mt-auto">
                    <Button variant="outline-primary" className="btn-cart-premium flex-fill" onClick={() => addToCart(product.id, 1)}>Add to Cart</Button>
                    <Button variant="dark" className="btn-cart-premium flex-fill" as={Link} to={`/product/${product.id}`}>View</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-4">
          <Button variant="outline-primary" className="btn-hero" as={Link} to="/products">View All New Arrivals</Button>
        </div>
      </Container>

      {/* ================= FEATURED PRODUCTS ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">Featured Products</h2>
        <Row>
          {featuredProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="product-card-premium">
                <Card.Img variant="top" src={getFullImageUrl(product.image)} className="product-img-premium" onError={(e) => { e.target.src = '/placeholder-image.png'; }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-title-premium">{product.name}</Card.Title>
                  <Card.Text className="product-price-premium">₦{(parseFloat(product.price) || 0).toFixed(2)}</Card.Text>
                  <div className="d-flex gap-2 mt-auto">
                    <Button variant="outline-primary" className="btn-cart-premium flex-fill" onClick={() => addToCart(product.id, 1)}>Add to Cart</Button>
                    <Button variant="dark" className="btn-cart-premium flex-fill" as={Link} to={`/product/${product.id}`}>View</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-4">
          <Button variant="outline-primary" className="btn-hero" as={Link} to="/products">View All Products</Button>
        </div>
      </Container>

      {/* ================= SHOP BY CATEGORY ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">Shop by Category</h2>
        <Row>
          {categories.map((cat) => (
            <Col key={cat.id} xs={6} md={4} lg={2} className="mb-4">
              <Link to={`/category/${cat.slug}`} style={{ textDecoration: "none" }}>
                <div className="category-card-premium">
                  <img src={cat.image} alt={cat.name} className="category-img-premium" />
                  <div className="category-overlay-premium">{cat.name}</div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================= PROMO BANNER ================= */}
      <div className="promo-banner-premium">
        <Container>
          <h2 className="promo-title-premium">Summer Sale – Up to 50% Off!</h2>
          <p className="promo-subtitle-premium">Limited time offer on selected items. Don't miss out!</p>
          <Button className="btn-promo-premium" as={Link} to="/products?tag=sale">Shop the Sale</Button>
        </Container>
      </div>

      {/* ================= WHY CHOOSE US ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">Why Choose Us</h2>
        <Row>
          <Col md={3} sm={6} className="mb-4"><div className="feature-item-premium text-center"><div className="feature-icon-premium"><FaTruck /></div><h5>Free Shipping</h5><p className="text-muted">On orders over ₦50,000</p></div></Col>
          <Col md={3} sm={6} className="mb-4"><div className="feature-item-premium text-center"><div className="feature-icon-premium"><FaUndo /></div><h5>30-Day Returns</h5><p className="text-muted">Hassle-free returns</p></div></Col>
          <Col md={3} sm={6} className="mb-4"><div className="feature-item-premium text-center"><div className="feature-icon-premium"><FaShieldAlt /></div><h5>Secure Payments</h5><p className="text-muted">100% secure checkout</p></div></Col>
          <Col md={3} sm={6} className="mb-4"><div className="feature-item-premium text-center"><div className="feature-icon-premium"><FaHeadset /></div><h5>24/7 Support</h5><p className="text-muted">Dedicated customer service</p></div></Col>
        </Row>
      </Container>

      {/* ================= BRAND STORY ================= */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="section-title-premium text-start" style={{ textAlign: "left" }}>Crafted for the Modern Gentleman</h2>
            <p className="text-muted mb-3">At Kingly Stores, we believe that true elegance lies in the details. Every piece in our collection is meticulously crafted with premium fabrics, timeless designs, and an unwavering commitment to quality.</p>
            <p className="text-muted mb-3">Our ateliers combine traditional tailoring techniques with contemporary innovation to create menswear that exudes confidence and sophistication.</p>
            <p className="text-muted">Join a legacy of discerning gentlemen who choose Kingly Stores for their wardrobe essentials.</p>
          </Col>
          <Col lg={6}>
            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a8f" alt="Craftsman" className="img-fluid rounded shadow" style={{ maxHeight: "400px", width: "100%", objectFit: "cover" }} />
          </Col>
        </Row>
      </Container>

      {/* ================= TRUSTED BRANDS ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">Trusted Brands</h2>
        <Row className="justify-content-center align-items-center">
          {brands.map((brand) => (
            <Col key={brand.id} xs={4} md={2} className="mb-3 text-center">
              <img src={brand.logo} alt={brand.name} className="brand-logo-premium" />
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================= CUSTOMER REVIEWS CAROUSEL ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">What Our Customers Say</h2>
        <Carousel indicators={false} controls={true} interval={5000}>
          {testimonials.map((t) => (
            <Carousel.Item key={t.id}>
              <div className="testimonial-card-premium">
                <img src={t.image} alt={t.name} className="testimonial-avatar-premium" />
                <div className="mb-3">{renderStars(t.rating)}</div>
                <p className="testimonial-text-premium">"{t.text}"</p>
                <h6 className="fw-bold mt-3">{t.name}</h6>
                <small className="text-muted">{t.date}</small>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>

      {/* ================= SIZE GUIDE BUTTON ================= */}
      <Container className="text-center mb-5">
        <Button variant="outline-primary" className="btn-hero" onClick={() => setShowSizeGuide(true)}>
          <FaRuler className="me-2" /> Size Guide
        </Button>
      </Container>

      {/* ================= CUSTOMER GALLERY (#KinglyStyle) ================= */}
      <Container fluid className="px-0 py-5">
        <h2 className="section-title-premium">#KinglyStyle</h2>
        <p className="text-center text-muted mb-4">Share your look and tag us @kinglystores</p>
        <div className="insta-grid-premium">
          {[
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
            "https://images.unsplash.com/photo-1516826957135-700dedea698c",
            "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
          ].map((img, idx) => (
            <div key={idx} className="insta-item-premium">
              <img src={img} alt="Customer gallery" className="insta-img-premium" />
            </div>
          ))}
        </div>
      </Container>

      {/* ================= BLOG HIGHLIGHTS ================= */}
      <Container className="py-5">
        <h2 className="section-title-premium">From Our Blog</h2>
        <Row>
          {blogPosts.map((post) => (
            <Col key={post.id} md={4} className="mb-4">
              <Card className="blog-card-premium">
                <Card.Img variant="top" src={getFullImageUrl(post.image_url)} className="blog-img-premium" onError={(e) => { e.target.src = '/placeholder-image.png'; }} />
                <Card.Body>
                  <Card.Title className="blog-title-premium">{post.title}</Card.Title>
                  <div className="blog-date-premium">{new Date(post.published_at).toLocaleDateString()}</div>
                  <Card.Text className="blog-excerpt-premium">{post.excerpt || (post.content && post.content.substring(0, 100) + '...')}</Card.Text>
                  <Button variant="link" className="read-more-premium" onClick={() => handleReadMore(post)}>Read More →</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================= INSTAGRAM FEED ================= */}
      <Container fluid className="px-0 py-5">
        <h2 className="section-title-premium">Follow Us on Instagram</h2>
        <div className="insta-grid-premium">
          {instaPosts.map((img, idx) => (
            <div key={idx} className="insta-item-premium">
              <img src={img} alt="Instagram" className="insta-img-premium" />
            </div>
          ))}
        </div>
      </Container>

      {/* ================= LOYALTY TEASER ================= */}
      <Container className="py-5">
        <div className="text-center p-5 border rounded shadow-sm" style={{ background: "linear-gradient(135deg, #f9fafb, #fff)" }}>
          <h3 className="fw-bold mb-3">Join the Kingly Circle</h3>
          <p className="text-muted mb-4">Earn points on every purchase, enjoy exclusive previews, and unlock members‑only discounts.</p>
          <Button className="btn-hero" as={Link} to="/loyalty">Learn More</Button>
        </div>
      </Container>

      {/* ================= COMPLAINT SECTION ================= */}
      <div className="newsletter-premium">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <h3 className="newsletter-title-premium">Have a Complaint?</h3>
              <p className="text-white-50 mb-4">We value your feedback. Send us your complaint and we'll get back to you.</p>
              <Form onSubmit={handleComplaintSubmit} className="d-flex flex-column gap-3">
                <Form.Control type="text" placeholder="Your Name" value={complaintData.name} onChange={(e) => setComplaintData({ ...complaintData, name: e.target.value })} required className="form-control-premium" />
                <Form.Control type="email" placeholder="Your Email" value={complaintData.email} onChange={(e) => setComplaintData({ ...complaintData, email: e.target.value })} required className="form-control-premium" />
                <Form.Control as="textarea" rows={4} placeholder="Your Complaint / Message" value={complaintData.message} onChange={(e) => setComplaintData({ ...complaintData, message: e.target.value })} required className="form-control-premium" />
                <Button type="submit" className="newsletter-btn-premium">Submit Complaint</Button>
                {complaintStatus.success && <div className="alert alert-success mt-2">Thank you! Your complaint has been submitted.</div>}
                {complaintStatus.error && <div className="alert alert-danger mt-2">Submission failed. Please try again later.</div>}
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ================= BACK TO TOP BUTTON ================= */}
      <div className="back-to-top-premium" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</div>

      {/* ================= BLOG POST MODAL ================= */}
      <Modal show={showBlogModal} onHide={() => setShowBlogModal(false)} size="lg" centered className="modal-premium">
        <Modal.Header closeButton><Modal.Title>{selectedPost?.title}</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedPost?.image_url && (
            <div className="text-center mb-4">
              <img src={getFullImageUrl(selectedPost.image_url)} alt={selectedPost.title} style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} />
            </div>
          )}
          <div className="text-muted mb-3"><small>Published on {new Date(selectedPost?.published_at).toLocaleDateString()} by {selectedPost?.author || 'Admin'}</small></div>
          <div style={{ whiteSpace: "pre-wrap" }}>{selectedPost?.content}</div>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowBlogModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      {/* ================= SIZE GUIDE MODAL ================= */}
      <Modal show={showSizeGuide} onHide={() => setShowSizeGuide(false)} size="lg" centered className="modal-premium">
        <Modal.Header closeButton><Modal.Title>Size Guide – Kingly Stores</Modal.Title></Modal.Header>
        <Modal.Body>
          <h5 className="mb-3">Men’s Clothing Sizes</h5>
          <p className="text-muted small mb-4">Find your perfect fit with our size chart below.</p>
          <h6>Shirts & Jackets (Chest in inches)</h6>
          <Table striped bordered hover responsive>
            <thead><tr><th>Size</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th></tr></thead>
            <tbody><tr><td>Chest</td><td>34-36</td><td>36-38</td><td>38-40</td><td>40-42</td><td>42-44</td><td>44-46</td></tr><tr><td>Waist</td><td>28-30</td><td>30-32</td><td>32-34</td><td>34-36</td><td>36-38</td><td>38-40</td></tr></tbody>
          </Table>
          <h6 className="mt-4">Trousers (Waist in inches)</h6>
          <Table striped bordered hover responsive>
            <thead><tr><th>Size</th><th>28</th><th>30</th><th>32</th><th>34</th><th>36</th><th>38</th><th>40</th></tr></thead>
            <tbody><tr><td>Waist</td><td>28</td><td>30</td><td>32</td><td>34</td><td>36</td><td>38</td><td>40</td></tr><tr><td>Inseam</td><td>30</td><td>31</td><td>32</td><td>33</td><td>34</td><td>34</td><td>35</td></tr></tbody>
          </Table>
          <h6 className="mt-4">Shoes (UK sizes)</h6>
          <Table striped bordered hover responsive>
            <thead><tr><th>UK</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th></tr></thead>
            <tbody><tr><td>US</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr><tr><td>EU</td><td>40</td><td>41</td><td>42</td><td>43</td><td>44</td><td>45</td><td>46</td></tr></tbody>
          </Table>
          <p className="text-muted small mt-3">* If you’re between sizes, we recommend ordering the larger size for a comfortable fit.</p>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowSizeGuide(false)}>Close</Button></Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;