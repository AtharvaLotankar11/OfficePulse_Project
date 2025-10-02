const Booking = require('../models/Booking');
const User = require('../models/User');

// Create Booking
const createBooking = async (req, res) => {
  try {
    const { deskId, deskName, floor, zone, date, startTime, endTime, purpose } = req.body;

    // Validation
    if (!deskId || !deskName || !floor || !zone || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields are required'
      });
    }

    // Check for conflicting bookings
    const existingBooking = await Booking.findOne({
      deskId,
      date: new Date(date),
      status: 'active',
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Desk is already booked for the selected time slot'
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      deskId,
      deskName,
      floor,
      zone,
      date: new Date(date),
      startTime,
      endTime,
      purpose: purpose || ''
    });

    await booking.save();
    await booking.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during booking creation',
      error: error.message
    });
  }
};

// Get User Bookings
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
};

// Get All Bookings (for desk availability check)
const getAllBookings = async (req, res) => {
  try {
    const { date, deskId } = req.query;
    
    const query = { status: 'active' };
    if (date) query.date = new Date(date);
    if (deskId) query.deskId = parseInt(deskId);

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking'
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking
};