const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');

const router = express.Router();
router.get('/', listRoutes);
router.get('/:id', getRoute);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Operations Manager']), createRoute);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager']), updateRoute);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteRoute);

module.exports = router;