const express = require('express');
const router = express.Router();
const {
  updateProfile, toggleWishlist, getAllUsers, getUserById, updateUserRole, deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
