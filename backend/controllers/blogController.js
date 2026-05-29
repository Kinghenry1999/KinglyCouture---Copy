import * as Blog from "../models/Blog.js";

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Blog.getAllBlogPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Blog.getBlogPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, author } = req.body;
    const file = req.file;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const imageUrl = file ? req.file.path : null;   // Cloudinary URL

    const newPost = await Blog.createBlogPost(
      title,
      content,
      excerpt || null,
      imageUrl,
      author || "Admin"
    );

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author } = req.body;
    const file = req.file;

    const existing = await Blog.getBlogPostById(id);
    if (!existing) return res.status(404).json({ message: "Post not found" });

    let imageUrl = existing.image_url;
    if (file) {
      imageUrl = req.file.path;
    }

    const updated = await Blog.updateBlogPost(
      id,
      title,
      content,
      excerpt || null,
      imageUrl,
      author || "Admin"
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Blog.deleteBlogPost(id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};