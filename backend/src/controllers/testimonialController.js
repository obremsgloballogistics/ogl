const Testimonial = require('../models/Testimonial');

async function listTestimonials(req, res) {
  const testimonials = await Testimonial.find({ published: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: testimonials });
}

async function getTestimonial(req, res) {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  res.json({ success: true, data: testimonial });
}

async function createTestimonial(req, res) {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
}

async function updateTestimonial(req, res) {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  res.json({ success: true, data: testimonial });
}

async function deleteTestimonial(req, res) {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  res.json({ success: true, message: 'Testimonial deleted' });
}

module.exports = { listTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial };