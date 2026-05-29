// src/Pages/Checkout.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utility/Api";
import "../styles/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotal, fetchCart } = useCart();
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Nigeria",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    if (!cart.length) {
      navigate("/products");
    }
  }, [cart, navigate]);

  useEffect(() => {
    if (!paystackPublicKey) {
      setError("Paystack public key is missing. Check your .env file.");
    }
  }, [paystackPublicKey]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await api.post("/coupons/apply", {
        code: couponCode.trim(),
        orderTotal: getTotal(),
      });
      setCouponDiscount(res.data.discount);
      setCouponApplied(res.data);
    } catch (err) {
      setCouponDiscount(0);
      setCouponApplied(null);
      setCouponError(err.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const finalTotal = getTotal() - couponDiscount;

  const payWithPaystack = () => {
    setError("");

    const requiredFields = ['name', 'address', 'city', 'state', 'zip'];
    const missing = requiredFields.find(field => !shippingAddress[field]);
    if (missing) {
      setError("Please fill in all shipping address fields.");
      return;
    }

    if (!window.PaystackPop) {
      setError("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    if (!paystackPublicKey) {
      setError("Payment cannot be processed at this time. (Missing public key)");
      return;
    }

    const amountInKobo = Math.round(finalTotal * 100);

    if (!amountInKobo || amountInKobo <= 0) {
      setError("Invalid cart total. Please check your cart and try again.");
      return;
    }

    const reference = "ref_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);

    const paymentCallback = (response) => {
      setProcessing(true);

      (async () => {
        try {
          const verifyRes = await api.post("/orders/verify-paystack", {
            reference: response.reference,
          });

          if (!verifyRes.data.success) {
            throw new Error(verifyRes.data.message || "Payment verification failed");
          }

          const orderData = {
            items: cart.map(item => ({
              productId: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            totalAmount: finalTotal,
            shippingAddress,
            paymentReference: response.reference,
            paymentProvider: 'paystack',
          };

          await api.post("/orders", orderData);
          await fetchCart();
          navigate("/order-success");
        } catch (err) {
          console.error("Order creation error:", err);
          setError(err.response?.data?.message || err.message || "Failed to complete order.");
          setProcessing(false);
        }
      })();
    };

    const onClose = () => {
      console.log("Payment window closed by user");
    };

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: user?.email || "customer@example.com",
      amount: amountInKobo,
      currency: "NGN",
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Order Total",
            variable_name: "order_total",
            value: finalTotal.toFixed(2),
          },
        ],
        shipping_address: shippingAddress,
      },
      callback: paymentCallback,
      onClose: onClose,
    });

    handler.openIframe();
  };

  if (!cart.length) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Redirecting to products...</p>
      </Container>
    );
  }

  return (
    <Container className="checkout-container">
      <h2 className="checkout-title">Secure Checkout</h2>
      <Row>
        <Col md={6}>
          <Card className="checkout-card">
            <Card.Header>Shipping Address</Card.Header>
            <Card.Body>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">Address</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">City</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">State</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">ZIP Code</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
              <Form.Group className="form-group-premium">
                <Form.Label className="form-label-premium">Country</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="form-control-premium"
                  required
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="checkout-card">
            <Card.Header>Order Summary</Card.Header>
            <Card.Body>
              {cart.map((item) => (
                <div key={item.product_id} className="order-summary-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="mt-3">
                <Form.Label className="form-label-premium">Coupon Code</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="form-control-premium"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="ms-2 btn-paystack"
                    style={{ width: "auto" }}
                  >
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {couponError && <small className="text-danger">{couponError}</small>}
                {couponApplied && (
                  <small className="text-success">
                    Coupon "{couponApplied.code}" applied: -₦{couponDiscount.toFixed(2)}
                  </small>
                )}
              </div>

              <div className="order-summary-total mt-3">
                {couponApplied && (
                  <div className="d-flex justify-content-between">
                    <span>Discount</span>
                    <span>-₦{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between">
                  <span>Total</span>
                  <span>₦{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {error && <Alert variant="danger" className="checkout-alert">{error}</Alert>}

          <Button className="btn-paystack" onClick={payWithPaystack} disabled={processing}>
            {processing ? <Spinner animation="border" size="sm" className="checkout-spinner" /> : "Pay with Paystack"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;