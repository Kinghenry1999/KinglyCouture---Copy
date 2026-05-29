// src/Pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Image, Spinner, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../utility/Api";
import { CATEGORIES } from "../constants/Categories";
import BlogManagement from "./BlogManagement";
import ComplaintManagement from "./complaintManagement";
import CouponManagement from "./CouponManagement";
import { useAuth } from "../context/AuthContext";
import { getFullImageUrl } from "../utility/imageUtils";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 34,
    totalRevenue: "₦4,560",
    lowStock: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/posts");
        const data = response.data;
        setProducts(data);
        setFilteredProducts(data);
        setStats(prev => ({
          ...prev,
          totalProducts: data.length,
          lowStock: data.filter(p => (p.quantity !== undefined && p.quantity < 5) || (!p.quantity && p.quantity !== undefined && p.quantity === 0)).length
        }));
      } catch (err) {
        toast.error("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, products]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!showForm) {
      setImagePreview(null);
      setSelectedFile(null);
      setFormErrors({});
    } else if (selectedProduct) {
      setImagePreview(getFullImageUrl(selectedProduct.image));
    }
  }, [showForm, selectedProduct]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      console.log('✅ File selected:', file.name);
    } else {
      console.log('❌ No file selected');
    }
  };

  const validateForm = (form) => {
    const errors = {};
    if (!form.name.value.trim()) errors.name = "Name is required";
    if (!form.price.value || parseFloat(form.price.value) <= 0) errors.price = "Valid price is required";
    if (!selectedProduct && !selectedFile) errors.image = "Image is required";
    return errors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const errors = validateForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      console.log('Validation errors:', errors);
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('price', form.price.value);
    formData.append('category', form.category.value);
    formData.append('featured', form.featured.checked);
    formData.append('description', form.description.value);   // description added
    if (selectedFile) {
      formData.append('image', selectedFile);
      console.log('📎 Appending image:', selectedFile.name);
    }

    try {
      let response;
      if (selectedProduct) {
        response = await api.put(`/posts/${selectedProduct.id}`, formData);
        setProducts(products.map(p => p.id === selectedProduct.id ? response.data : p));
        toast.success("Product updated successfully");
      } else {
        response = await api.post("/posts", formData);
        setProducts([...products, response.data]);
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
        toast.success("Product added successfully");
      }
      setShowForm(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Upload error object:", err);
      const msg = err.response?.data?.message || err.message || "Operation failed";
      toast.error(msg);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setProducts(products.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getProgressPercent = (value, target) => Math.min((value / target) * 100, 100);
  const productTarget = 100;
  const ordersTarget = 100;
  const revenueTarget = 10000;
  const lowStockPercent = stats.totalProducts ? (stats.lowStock / stats.totalProducts) * 100 : 0;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-sidebar skeleton">
          <div className="sidebar-header"><div className="skeleton-text"></div></div>
          <ul className="sidebar-nav"><li><div className="skeleton-text"></div></li></ul>
        </div>
        <div className="dashboard-main">
          <div className="top-navbar skeleton"><div className="skeleton-text"></div></div>
          <div className="stats-grid">{[1,2,3,4].map(i => <div key={i} className="stat-card skeleton"><div className="skeleton-text"></div></div>)}</div>
          <div className="table-card skeleton"><div className="skeleton-text"></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>{sidebarCollapsed ? "K" : "Admin Panel"}</h3>
        </div>
        <ul className="sidebar-nav">
          <li><button className={`sidebar-link ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}><i className="bi bi-box"></i>{!sidebarCollapsed && <span>Products</span>}</button></li>
          <li><button className={`sidebar-link ${activeTab === "blog" ? "active" : ""}`} onClick={() => setActiveTab("blog")}><i className="bi bi-newspaper"></i>{!sidebarCollapsed && <span>Blog</span>}</button></li>
          <li><button className={`sidebar-link ${activeTab === "complaints" ? "active" : ""}`} onClick={() => setActiveTab("complaints")}><i className="bi bi-chat-dots"></i>{!sidebarCollapsed && <span>Complaints</span>}</button></li>
          <li><button className={`sidebar-link ${activeTab === "coupons" ? "active" : ""}`} onClick={() => setActiveTab("coupons")}><i className="bi bi-ticket-perforated"></i>{!sidebarCollapsed && <span>Coupons</span>}</button></li>
          <li><button className="sidebar-link" onClick={() => console.log("Orders")}><i className="bi bi-cart"></i>{!sidebarCollapsed && <span>Orders</span>}</button></li>
          <li><button className="sidebar-link" onClick={() => console.log("Settings")}><i className="bi bi-gear"></i>{!sidebarCollapsed && <span>Settings</span>}</button></li>
        </ul>
        <div className="sidebar-footer">
          <button className="sidebar-link logout-btn" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i>{!sidebarCollapsed && <span>Logout</span>}</button>
        </div>
      </div>
      {!sidebarCollapsed && <div className="sidebar-overlay" onClick={() => setSidebarCollapsed(true)}></div>}
      <div className="dashboard-main">
        <div className="top-navbar">
          <div className="navbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><i className="bi bi-list"></i></button>
            <h2 className="page-title">
              {activeTab === "products" && "Products Dashboard"}
              {activeTab === "blog" && "Blog Management"}
              {activeTab === "complaints" && "Complaints Management"}
              {activeTab === "coupons" && "Coupon Management"}
            </h2>
          </div>
          <div className="navbar-right">
            {activeTab === "products" && (
              <div className="search-wrapper">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            )}
            <div className="admin-profile"><i className="bi bi-person-circle"></i><span>Admin</span></div>
          </div>
        </div>
        {activeTab === "products" ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <i className="bi bi-box-seam"></i>
                <div className="stat-info"><h5>Total Products</h5><h3>{stats.totalProducts}</h3><div className="progress-bar-container"><div className="progress-bar" style={{ width: `${getProgressPercent(stats.totalProducts, productTarget)}%` }}></div></div></div>
              </div>
              <div className="stat-card"><i className="bi bi-cart-check"></i><div className="stat-info"><h5>Total Orders</h5><h3>{stats.totalOrders}</h3></div></div>
              <div className="stat-card"><i className="bi bi-currency-naira"></i><div className="stat-info"><h5>Total Revenue</h5><h3>{stats.totalRevenue}</h3></div></div>
              <div className="stat-card"><i className="bi bi-exclamation-triangle"></i><div className="stat-info"><h5>Low Stock</h5><h3>{stats.lowStock}</h3></div></div>
            </div>
            <Card className="table-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Products</h5>
                <div className="filter-actions">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-filter">
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <Button className="add-product-btn" onClick={() => { setSelectedProduct(null); setShowForm(true); }}><i className="bi bi-plus-lg"></i> Add Product</Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Image</th><th>Name</th><th>Price (₦)</th><th>Category</th><th>Featured</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td><img src={getFullImageUrl(product.image)} alt={product.name} className="product-image" /></td>
                        <td>{product.name}</td>
                        <td>₦{product.price}</td>
                        <td>{product.category || "N/A"}</td>
                        <td>{product.featured ? "✅" : "❌"}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn edit" onClick={() => handleEdit(product)}>Edit</button>
                            <button className="action-btn delete" onClick={() => handleDelete(product.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {filteredProducts.length > 0 && (
                  <div className="table-footer">
                    <div className="pagination-info">Showing {indexOfFirstItem+1}–{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}</div>
                    <Pagination className="pagination-custom">
                      <Pagination.Prev onClick={() => paginate(currentPage-1)} disabled={currentPage===1} />
                      {[...Array(totalPages).keys()].map(num => (
                        <Pagination.Item key={num+1} active={num+1===currentPage} onClick={() => paginate(num+1)}>{num+1}</Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => paginate(currentPage+1)} disabled={currentPage===totalPages} />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>{selectedProduct ? "Edit Product" : "Add Product"}</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleSave} encType="multipart/form-data">
                <Modal.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control name="name" defaultValue={selectedProduct?.name} required isInvalid={!!formErrors.name} />
                        <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Price (₦) *</Form.Label>
                        <Form.Control name="price" type="number" step="0.01" defaultValue={selectedProduct?.price} required isInvalid={!!formErrors.price} />
                        <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Category *</Form.Label>
                        <Form.Select name="category" defaultValue={selectedProduct?.category || CATEGORIES[0]} required>
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Featured" name="featured" defaultChecked={selectedProduct?.featured} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Image {!selectedProduct && "*"}</Form.Label>
                        <div className="file-upload-area">
                          <Form.Control type="file" accept="image/*" onChange={handleFileChange} required={!selectedProduct} isInvalid={!!formErrors.image} />
                          {formErrors.image && <div className="invalid-feedback d-block">{formErrors.image}</div>}
                          {imagePreview && (
                            <div className="image-preview mt-3">
                              <Image src={imagePreview} thumbnail style={{ maxHeight: "150px" }} />
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Description field */}
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      defaultValue={selectedProduct?.description || ''}
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button variant="success" type="submit">{selectedProduct ? "Update" : "Add"}</Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </>
        ) : activeTab === "blog" ? (
          <div className="full-width-content"><BlogManagement /></div>
        ) : activeTab === "complaints" ? (
          <div className="full-width-content"><ComplaintManagement /></div>
        ) : activeTab === "coupons" ? (
          <div className="full-width-content"><CouponManagement /></div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;