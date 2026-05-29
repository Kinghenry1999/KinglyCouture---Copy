// src/Pages/BlogManagement.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Image } from "react-bootstrap";
import api from "../utility/Api";
import { getFullImageUrl } from "../utility/imageUtils";

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/blog");
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showForm) {
      setImagePreview(null);
      setSelectedFile(null);
    } else if (selectedPost && selectedPost.image_url) {
      setImagePreview(getFullImageUrl(selectedPost.image_url));
    }
  }, [showForm, selectedPost]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;

    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('content', form.content.value);
    formData.append('excerpt', form.excerpt.value);
    formData.append('author', form.author.value);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      if (selectedPost) {
        // CORRECTED: no manual Content-Type header
        await api.put(`/blog/${selectedPost.id}`, formData);
      } else {
        // CORRECTED: no manual Content-Type header
        await api.post("/blog", formData);
      }
      fetchPosts();
      setShowForm(false);
      setSelectedPost(null);
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/blog/${id}`);
      fetchPosts();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container fluid>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Blog Posts</h5>
          <Button variant="success" onClick={() => { setSelectedPost(null); setShowForm(true); }}>
            Add Post
          </Button>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>
                    {post.image_url && (
                      <img src={getFullImageUrl(post.image_url)} alt={post.title} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                    )}
                  </td>
                  <td>{post.title}</td>
                  <td>{post.author}</td>
                  <td>{new Date(post.published_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                    <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(post.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Form */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedPost ? "Edit Post" : "New Post"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control name="title" defaultValue={selectedPost?.title} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Control name="author" defaultValue={selectedPost?.author || "Admin"} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Excerpt (short summary)</Form.Label>
                  <Form.Control as="textarea" rows={3} name="excerpt" defaultValue={selectedPost?.excerpt} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control as="textarea" rows={6} name="content" defaultValue={selectedPost?.content} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Featured Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <div className="mt-2">
                  <Image src={imagePreview} thumbnail style={{ maxHeight: "150px" }} />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default BlogManagement;