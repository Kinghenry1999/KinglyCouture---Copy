import { useState, useEffect } from "react";
import { Container, Card, Spinner, Button } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="text-center mt-5">
        <h3>Order not found</h3>
        <Button as={Link} to="/orders" variant="primary">Back to Orders</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2>Order #{order.id}</h2>
      <Card>
        <Card.Body>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ₦{parseFloat(order.total_amount).toFixed(2)}</p>
          <p><strong>Shipping Address:</strong> {JSON.stringify(order.shipping_address)}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

          <h5 className="mt-4">Items</h5>
          {order.items?.map((item, idx) => (
            <div key={idx} className="d-flex align-items-center mb-3">
              {item.image && (
                <img
                  src={getFullImageUrl(item.image)}
                  alt={item.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover", marginRight: "20px" }}
                />
              )}
              <div>
                <h6>{item.name}</h6>
                <p>Price: ₦{item.price} | Quantity: {item.quantity}</p>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderDetail;