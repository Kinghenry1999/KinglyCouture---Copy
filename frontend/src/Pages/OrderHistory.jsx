import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, ListGroup, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Order #{order.id}</h5>
                  <p>
                    Date: {new Date(order.created_at).toLocaleDateString()} | Status:{" "}
                    <Badge bg={order.status === "completed" ? "success" : "warning"}>{order.status}</Badge>
                  </p>
                  <p>Total: ₦{parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <Button as={Link} to={`/order/${order.id}`} variant="outline-primary" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
              {/* Optionally list items */}
              {order.items && (
                <div className="mt-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center">
                      {item.image && (
                        <img
                          src={getFullImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                        />
                      )}
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default OrderHistory;