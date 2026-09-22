const BlogPost = require('../models/BlogPost');

async function listBlogPosts(req, res) {
  const query = { published: true };
  if (req.query.preview === 'true') delete query.published;
  const posts = await BlogPost.find(query).sort({ publishedAt: -1, createdAt: -1 });
  res.json({ success: true, data: posts });
}

async function getBlogPost(req, res) {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}

async function createBlogPost(req, res) {
  const post = await BlogPost.create(req.body);
  res.status(201).json({ success: true, data: post });
}

async function updateBlogPost(req, res) {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}

async function deleteBlogPost(req, res) {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, message: 'Post deleted' });
}

module.exports = { listBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost };