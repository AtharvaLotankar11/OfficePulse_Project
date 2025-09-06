const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking
} = require('../controllers/bookingController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// All booking routes are protected
router.use(authMiddleware);

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/all', getAllBookings);
router.patch('/:bookingId/cancel', cancelBooking);

module.exports = router;