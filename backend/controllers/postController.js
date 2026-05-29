import * as Post from "../models/Post.js";

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedPosts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const posts = await Post.getFeaturedPosts(limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const posts = await Post.getPostsByCategory(category);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.getPostById(id);
    if (!post) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { name, price, category, featured, quantity } = req.body;
    const file = req.file;

    if (!name || !price || !category || !file) {
      return res.status(400).json({ message: "Name, price, category, and image are required" });
    }

    // ✅ Cloudinary direct URL
    const imageUrl = req.file.path;

    const isFeatured = featured === 'true' || featured === true;
    if (isFeatured) {
      const featuredCount = await Post.countFeaturedPosts();
      if (featuredCount >= 20) {
        return res.status(400).json({ message: "Cannot have more than 20 featured products" });
      }
    }

    const newPost = await Post.createPost(
      name,
      price,
      imageUrl,
      category,
      isFeatured,
      quantity || 0,
      req.user.id
    );

    // Transform to send 'image' field
    const responsePost = { ...newPost, image: newPost.image_url };
    delete responsePost.image_url;

    res.status(201).json(responsePost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, category, featured, quantity } = req.body;
    const file = req.file;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const currentPost = await Post.getPostById(id);
    if (!currentPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Keep old image if no new file uploaded
    let imageUrl = currentPost.image;
    if (file) {
      imageUrl = req.file.path;   // Cloudinary URL
    }

    const newFeatured = featured === 'true' || featured === true;
    if (newFeatured && !currentPost.featured) {
      const featuredCount = await Post.countFeaturedPosts();
      if (featuredCount >= 20) {
        return res.status(400).json({ message: "Cannot have more than 20 featured products" });
      }
    }

    const updated = await Post.updatePost(
      id,
      name,
      price,
      imageUrl,
      category,
      newFeatured,
      quantity !== undefined ? quantity : currentPost.quantity
    );

    const responsePost = { ...updated, image: updated.image_url };
    delete responsePost.image_url;

    res.json(responsePost);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Post.deletePost(id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};